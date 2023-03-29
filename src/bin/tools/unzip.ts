import { createReadStream, createWriteStream } from "fs";
import { mkdir, stat, unlink } from "fs/promises";
import { dirname as pathDirname, join as pathJoin, relative as pathRelative } from "path";
import { type Readable } from "stream";
import { createInflateRaw } from "zlib";
import { partitionPromiseSettledResults } from "./partitionPromiseSettledResults";

export type MultiError = Error & { cause: Error[] };

/**
 * Extract the archive `zipFile` into the directory `dir`. If `archiveDir` is given,
 * only that directory will be extracted, stripping the given path components.
 *
 * If dir does not exist, it will be created.
 *
 * If any archive file exists, it will be overwritten.
 *
 * Will unzip using all available nodejs worker threads.
 *
 * Will try to clean up extracted files on failure.
 *
 * If unpacking fails, will either throw an regular error, or
 * possibly an `MultiError`, which contains a `cause` field with
 * a number of root cause errors.
 *
 * Warning this method is not optimized for continuous reading of the zip
 * archive, but is a trade-off between simplicity and allowing extraction
 * of a single directory from the archive.
 *
 * @param zipFilePath the file to unzip
 * @param extractDirPath the target directory
 * @param pathOfDirToExtractInArchive if given, unpack only files from this archive directory
 * @throws {MultiError} error
 * @returns Promise for a list of full file paths pointing to actually extracted files
 */
export async function unzip(zipFilePath: string, extractDirPath: string, pathOfDirToExtractInArchive?: string): Promise<string[]> {
    const dirsCreated: (string | undefined)[] = [];
    dirsCreated.push(await mkdir(extractDirPath, { recursive: true }));
    const promises: Promise<string>[] = [];

    // Iterate over all files in the zip, skip files which are not in archiveDir,
    // if given.
    for await (const record of iterateZipArchive(zipFilePath)) {
        const { path: recordPath, createReadStream: createRecordReadStream } = record;
        if (pathOfDirToExtractInArchive && !recordPath.startsWith(pathOfDirToExtractInArchive)) {
            continue;
        }
        const relativePath = pathOfDirToExtractInArchive ? pathRelative(pathOfDirToExtractInArchive, recordPath) : recordPath;
        const filePath = pathJoin(extractDirPath, relativePath);
        const parent = pathDirname(filePath);
        promises.push(
            new Promise<string>(async (resolve, reject) => {
                if (!dirsCreated.includes(parent)) dirsCreated.push(await mkdir(parent, { recursive: true }));

                // Pull the file out of the archive, write it to the target directory
                const output = createWriteStream(filePath);
                output.on("error", e => reject(Object.assign(e, { filePath })));
                output.on("finish", () => resolve(filePath));
                createRecordReadStream().pipe(output);
            })
        );
    }

    // Wait until _all_ files are either extracted or failed
    const [success, failure] = (await Promise.allSettled(promises)).reduce(...partitionPromiseSettledResults<string>());

    // If any extraction failed, try to clean up, then throw a MultiError,
    // which has a `cause` field, containing a list of root cause errors.
    if (failure.length) {
        await Promise.all([
            ...success.map(path => unlink(path).catch(_unused => undefined)),
            ...failure.map(e => e && e.path && unlink(e.path as string).catch(_unused => undefined))
        ]);
        await Promise.all(dirsCreated.filter(Boolean).sort(sortByFolderDepth("desc")));
        const e = new Error("Failed to extract: " + failure.map(e => e.message).join(";"));
        (e as any).cause = failure;
        throw e;
    }

    return success;
}

function depth(dir: string) {
    return dir.match(/\//g)?.length ?? 0;
}

function sortByFolderDepth(order: "asc" | "desc") {
    const ord = order === "asc" ? 1 : -1;
    return (a: string | undefined, b: string | undefined) => ord * depth(a ?? "") + -ord * depth(b ?? "");
}

/**
 *
 * @param file file to read
 * @param start first byte to read
 * @param end last byte to read
 * @returns Promise of a buffer of read bytes
 */
async function readFileChunk(file: string, start: number, end: number): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
        const stream = createReadStream(file, { start, end });
        stream.setMaxListeners(Infinity);
        stream.on("error", e => reject(e));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("data", chunk => chunks.push(chunk as Buffer));
    });
}

type ZipRecord = {
    path: string;
    createReadStream: () => Readable;
    compressionMethod: "deflate" | undefined;
};

type ZipRecordGenerator = AsyncGenerator<ZipRecord, void, unknown>;

/**
 * Iterate over all records of a zipfile, and yield a ZipRecord.
 * Use `record.createReadStream()` to actually read the file.
 *
 * Warning this method will only work with single-disk zip files.
 * Warning this method may fail if the zip archive has an crazy amount
 * of files and the central directory is not fully contained within the
 * last 65k bytes of the zip file.
 *
 * @param zipFile
 * @returns AsyncGenerator which will yield ZipRecords
 */
async function* iterateZipArchive(zipFile: string): ZipRecordGenerator {
    // Need to know zip file size before we can do anything  else
    const { size } = await stat(zipFile);
    const chunkSize = 65_535 + 22 + 1; // max comment size + end header size + wiggle
    // Read last ~65k bytes. Zip files have an comment up to 65_535 bytes at the very end,
    // before that comes the zip central directory end header.
    let chunk = await readFileChunk(zipFile, size - chunkSize, size);
    const unread = size - chunk.length;
    let i = chunk.length - 4;
    let found = false;
    // Find central directory end header, reading backwards from the end
    while (!found && i-- > 0) if (chunk[i] === 0x50 && chunk.readUInt32LE(i) === 0x06054b50) found = true;
    if (!found) throw new Error("Not a zip file");
    // This method will fail on a multi-disk zip, so bail early.
    if (chunk.readUInt16LE(i + 4) !== 0) throw new Error("Multi-disk zip not supported");
    let nFiles = chunk.readUint16LE(i + 10);
    // Get the position of the central directory
    const directorySize = chunk.readUint32LE(i + 12);
    const directoryOffset = chunk.readUint32LE(i + 16);
    if (directoryOffset === 0xffff_ffff) throw new Error("zip64 not supported");
    if (directoryOffset > size) throw new Error(`Central directory offset ${directoryOffset} is outside file`);
    i = directoryOffset - unread;
    // If i < 0, it means that the central directory is not contained within `chunk`
    if (i < 0) {
        chunk = await readFileChunk(zipFile, directoryOffset, directoryOffset + directorySize);
        i = 0;
    }
    // Now iterate the central directory records, yield an `ZipRecord` for every entry
    while (nFiles-- > 0) {
        // Check for marker bytes
        if (chunk.readUInt32LE(i) !== 0x02014b50) throw new Error("No central directory record at position " + (unread + i));
        const compressionMethod = ({ 8: "deflate" } as const)[chunk.readUint16LE(i + 10)];
        const compressedFileSize = chunk.readUint32LE(i + 20);
        const filenameLength = chunk.readUint16LE(i + 28);
        const extraLength = chunk.readUint16LE(i + 30);
        const commentLength = chunk.readUint16LE(i + 32);
        // Start of the actual content byte stream is after the 'local' record header,
        // which is  30 bytes long plus filename and extra field
        const start = chunk.readUint32LE(i + 42) + 30 + filenameLength + extraLength;
        const end = start + compressedFileSize;
        const filename = chunk.slice(i + 46, i + 46 + filenameLength).toString("utf-8");
        const createRecordReadStream = () => {
            const input = createReadStream(zipFile, { start, end });
            if (compressionMethod === "deflate") {
                const inflate = createInflateRaw();
                input.pipe(inflate);
                return inflate;
            }
            return input;
        };
        if (end > start) yield { path: filename, createReadStream: createRecordReadStream, compressionMethod };
        // advance pointer to next central directory entry
        i += 46 + filenameLength + extraLength + commentLength;
    }
}
