import { Transform, TransformOptions } from "stream";
import { createReadStream } from "fs";
import { stat } from "fs/promises";

import { deflateBuffer, deflateStream } from "./deflate";

/**
 * Zip source
 * @property filename the name of the entry in the archie
 * @property path of the source file, if the source is an actual file
 * @property data the actual data buffer, if the source is constructed in-memory
 */
export type ZipSource = { path: string } & ({ fsPath: string } | { data: Buffer });

export type ZipRecord = {
    path: string;
    compression: "deflate" | undefined;
    uncompressedSize: number;
    compressedSize?: number;
    crc32?: number;
    offset?: number;
};

/**
 * @returns the actual byte size of an string
 */
function utf8size(s: string) {
    return new Blob([s]).size;
}

/**
 * @param record
 * @returns a buffer representing a Zip local header
 * @link https://en.wikipedia.org/wiki/ZIP_(file_format)#Local_file_header
 */
function localHeader(record: ZipRecord) {
    const { path, compression, uncompressedSize } = record;
    const filenameSize = utf8size(path);
    const buf = Buffer.alloc(30 + filenameSize);

    buf.writeUInt32LE(0x04_03_4b_50, 0); // local header signature
    buf.writeUInt16LE(10, 4); // min version
    // we write 0x08 because crc and compressed size are unknown at
    buf.writeUInt16LE(0x08, 6); // general purpose bit flag
    buf.writeUInt16LE(compression ? ({ "deflate": 8 } as const)[compression] : 0, 8);
    buf.writeUInt16LE(0, 10); // modified time
    buf.writeUInt16LE(0, 12); // modified date
    buf.writeUInt32LE(0, 14); // crc unknown
    buf.writeUInt32LE(0, 18); // compressed size unknown
    buf.writeUInt32LE(uncompressedSize, 22);
    buf.writeUInt16LE(filenameSize, 26);
    buf.writeUInt16LE(0, 28); // extra field length
    buf.write(path, 30, "utf-8");

    return buf;
}

/**
 * @param record
 * @returns a buffer representing a Zip central header
 * @link https://en.wikipedia.org/wiki/ZIP_(file_format)#Central_directory_file_header
 */
function centralHeader(record: ZipRecord) {
    const { path, compression, crc32, compressedSize, uncompressedSize, offset } = record;
    const filenameSize = utf8size(path);
    const buf = Buffer.alloc(46 + filenameSize);
    const isFile = !path.endsWith("/");

    if (typeof offset === "undefined") throw new Error("Illegal argument");

    // we don't want to deal with possibly messed up file or directory
    // permissions, so we ignore the original permissions
    const externalAttr = isFile ? 0x81a40000 : 0x41ed0000;

    buf.writeUInt32LE(0x0201_4b50, 0); // central header signature
    buf.writeUInt16LE(10, 4); // version
    buf.writeUInt16LE(10, 6); // min version
    buf.writeUInt16LE(0, 8); // general purpose bit flag
    buf.writeUInt16LE(compression ? ({ "deflate": 8 } as const)[compression] : 0, 10);
    buf.writeUInt16LE(0, 12); // modified time
    buf.writeUInt16LE(0, 14); // modified date
    buf.writeUInt32LE(crc32 || 0, 16);
    buf.writeUInt32LE(compressedSize || 0, 20);
    buf.writeUInt32LE(uncompressedSize, 24);
    buf.writeUInt16LE(filenameSize, 28);
    buf.writeUInt16LE(0, 30); // extra field length
    buf.writeUInt16LE(0, 32); // comment field length
    buf.writeUInt16LE(0, 34); // disk number
    buf.writeUInt16LE(0, 36); // internal
    buf.writeUInt32LE(externalAttr, 38); // external
    buf.writeUInt32LE(offset, 42); // offset where file starts
    buf.write(path, 46, "utf-8");

    return buf;
}

/**
 * @returns a buffer representing an Zip End-Of-Central-Directory block
 * @link https://en.wikipedia.org/wiki/ZIP_(file_format)#End_of_central_directory_record_(EOCD)
 */
function eocd({ offset, cdSize, nRecords }: { offset: number; cdSize: number; nRecords: number }) {
    const buf = Buffer.alloc(22);
    buf.writeUint32LE(0x06054b50, 0); // eocd signature
    buf.writeUInt16LE(0, 4); // disc number
    buf.writeUint16LE(0, 6); // disc where central directory starts
    buf.writeUint16LE(nRecords, 8); // records on this disc
    buf.writeUInt16LE(nRecords, 10); // records total
    buf.writeUInt32LE(cdSize, 12); // byte size of cd
    buf.writeUInt32LE(offset, 16); // cd offset
    buf.writeUint16LE(0, 20); // comment length

    return buf;
}

/**
 * @returns a stream Transform, which reads a stream of ZipRecords and
 * writes a bytestream
 */
export default function zip() {
    /**
     * This is called when the input stream of ZipSource items is finished.
     * Will write central directory and end-of-central-direcotry blocks.
     */
    const final = () => {
        // write central directory
        let cdSize = 0;
        for (const record of records) {
            const head = centralHeader(record);
            zipTransform.push(head);
            cdSize += head.length;
        }

        // write end-of-central-directory
        zipTransform.push(eocd({ offset, cdSize, nRecords: records.length }));
        // signal stream end
        zipTransform.push(null);
    };

    /**
     * Write a directory entry to the archive
     * @param path
     */
    const writeDir = async (path: string) => {
        const record: ZipRecord = {
            path: path + "/",
            offset,
            compression: undefined,
            uncompressedSize: 0
        };
        const head = localHeader(record);
        zipTransform.push(head);
        records.push(record);
        offset += head.length;
    };

    /**
     * Write a file entry to the archive
     * @param archivePath path of the file in archive
     * @param fsPath path to file on filesystem
     * @param size of the actual, uncompressed, file
     */
    const writeFile = async (archivePath: string, fsPath: string, size: number) => {
        const record: ZipRecord = {
            path: archivePath,
            offset,
            compression: "deflate",
            uncompressedSize: size
        };
        const head = localHeader(record);
        zipTransform.push(head);

        const { crc32, compressedSize } = await deflateStream(createReadStream(fsPath), chunk => zipTransform.push(chunk));

        record.crc32 = crc32;
        record.compressedSize = compressedSize;
        records.push(record);
        offset += head.length + compressedSize;
    };

    /**
     * Write archive record based on filesystem file or directory
     * @param archivePath path of item in archive
     * @param fsPath path to item on filesystem
     */
    const writeFromPath = async (archivePath: string, fsPath: string) => {
        const fileStats = await stat(fsPath);
        fileStats.isDirectory() ? await writeDir(archivePath) /**/ : await writeFile(archivePath, fsPath, fileStats.size) /**/;
    };

    /**
     * Write archive record based on data in a buffer
     * @param path
     * @param data
     */
    const writeFromBuffer = async (path: string, data: Buffer) => {
        const { deflated, crc32 } = await deflateBuffer(data);
        const record: ZipRecord = {
            path,
            compression: "deflate",
            crc32,
            uncompressedSize: data.length,
            compressedSize: deflated.length,
            offset
        };
        const head = localHeader(record);
        zipTransform.push(head);
        zipTransform.push(deflated);
        records.push(record);
        offset += head.length + deflated.length;
    };

    /**
     * Write an archive record
     * @param source
     */
    const writeRecord = async (source: ZipSource) => {
        if ("fsPath" in source) await writeFromPath(source.path, source.fsPath);
        else if ("data" in source) await writeFromBuffer(source.path, source.data);
        else throw new Error("Illegal argument " + typeof source + "  " + JSON.stringify(source));
    };

    /**
     * The actual stream transform function
     * @param source
     * @param _ encoding, ignored
     * @param cb
     */
    const transform: TransformOptions["transform"] = async (source: ZipSource, _, cb) => {
        await writeRecord(source);
        cb();
    };

    /** offset and records keep local state during processing */
    let offset = 0;
    const records: ZipRecord[] = [];

    const zipTransform = new Transform({
        readableObjectMode: false,
        writableObjectMode: true,
        transform,
        final
    });

    return zipTransform;
}
