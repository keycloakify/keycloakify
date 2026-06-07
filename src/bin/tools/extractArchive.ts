import fs from "fs/promises";
import fsSync from "fs";
import yauzl from "yauzl";
import stream from "stream";
import { dirname as pathDirname, sep as pathSep } from "path";
import { existsAsync } from "./fs.existsAsync";

type ZipFileWithPromises = yauzl.ZipFile & {
    eachEntry: () => AsyncIterable<yauzl.Entry>;
    openReadStreamPromise: (
        entry: yauzl.Entry,
        options?: yauzl.ZipFileOptions
    ) => Promise<stream.Readable>;
};

type YauzlWithPromises = typeof yauzl & {
    openPromise: (path: string, options?: yauzl.Options) => Promise<ZipFileWithPromises>;
};

export async function extractArchive(params: {
    archiveFilePath: string;
    onArchiveFile: (params: {
        relativeFilePathInArchive: string;
        readFile: () => Promise<Buffer>;
        /** NOTE: Will create the directory if it does not exist */
        writeFile: (params: { filePath: string; modifiedData?: Buffer }) => Promise<void>;
        earlyExit: () => void;
    }) => Promise<void>;
}) {
    const { archiveFilePath, onArchiveFile } = params;

    const zipFile = await (yauzl as YauzlWithPromises).openPromise(archiveFilePath);

    const writeFile = async (
        entry: yauzl.Entry,
        params: {
            filePath: string;
            modifiedData?: Buffer;
        }
    ): Promise<void> => {
        const { filePath, modifiedData } = params;

        {
            const dirPath = pathDirname(filePath);

            if (!(await existsAsync(dirPath))) {
                await fs.mkdir(dirPath, { recursive: true });
            }
        }

        if (modifiedData !== undefined) {
            await fs.writeFile(filePath, modifiedData);
            return;
        }

        const readStream = await zipFile.openReadStreamPromise(entry);

        await new Promise<void>((resolve, reject) => {
            stream.pipeline(readStream, fsSync.createWriteStream(filePath), error => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve();
            });
        });
    };

    const readFile = async (entry: yauzl.Entry) => {
        const readStream = await zipFile.openReadStreamPromise(entry);

        return new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];

            readStream.on("data", chunk => {
                chunks.push(chunk);
            });

            readStream.on("end", () => {
                resolve(Buffer.concat(chunks));
            });

            readStream.on("error", reject);
        });
    };

    for await (const entry of zipFile.eachEntry()) {
        handle_file: {
            // NOTE: Skip directories
            if (entry.fileName.endsWith("/")) {
                break handle_file;
            }

            let hasEarlyExitBeenCalled = false;

            await onArchiveFile({
                relativeFilePathInArchive: entry.fileName.split("/").join(pathSep),
                readFile: () => readFile(entry),
                writeFile: params => writeFile(entry, params),
                earlyExit: () => {
                    hasEarlyExitBeenCalled = true;
                }
            });

            if (hasEarlyExitBeenCalled) {
                zipFile.close();
                return;
            }
        }
    }
}
