import fs from "fs/promises";
import fsSync from "fs";
import yauzl from "yauzl";
import stream from "stream";
import { Deferred } from "evt/tools/Deferred";
import { dirname as pathDirname, sep as pathSep } from "path";

export async function extractArchive(params: {
    archiveFilePath: string;
    onArchiveFile: (params: {
        relativeFilePathInArchive: string;
        readFile: () => Promise<Buffer>;
        writeFile: (params: { filePath: string; modifiedData?: Buffer }) => Promise<void>;
    }) => Promise<void>;
}) {
    const { archiveFilePath, onArchiveFile } = params;

    const zipFile = await new Promise<yauzl.ZipFile>((resolve, reject) => {
        yauzl.open(archiveFilePath, { lazyEntries: true }, async (error, zipFile) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(zipFile);
        });
    });

    const dDone = new Deferred<void>();

    zipFile.once("end", () => {
        zipFile.close();
        dDone.resolve();
    });

    const writeFile = async (
        entry: yauzl.Entry,
        params: {
            filePath: string;
            modifiedData?: Buffer;
        }
    ): Promise<void> => {
        const { filePath, modifiedData } = params;

        await fs.mkdir(pathDirname(filePath), { recursive: true });

        if (modifiedData !== undefined) {
            await fs.writeFile(filePath, modifiedData);
            return;
        }

        const readStream = await new Promise<stream.Readable>(resolve =>
            zipFile.openReadStream(entry, async (error, readStream) => {
                if (error) {
                    dDone.reject(error);
                    return;
                }

                resolve(readStream);
            })
        );

        const dDoneWithFile = new Deferred<void>();

        stream.pipeline(readStream, fsSync.createWriteStream(filePath), error => {
            if (error) {
                dDone.reject(error);
                return;
            }

            dDoneWithFile.resolve();
        });

        await dDoneWithFile.pr;
    };

    const readFile = (entry: yauzl.Entry) =>
        new Promise<Buffer>(resolve =>
            zipFile.openReadStream(entry, async (error, readStream) => {
                if (error) {
                    dDone.reject(error);
                    return;
                }

                const chunks: Buffer[] = [];

                readStream.on("data", chunk => {
                    chunks.push(chunk);
                });

                readStream.on("end", () => {
                    resolve(Buffer.concat(chunks));
                });

                readStream.on("error", error => {
                    dDone.reject(error);
                });
            })
        );

    zipFile.on("entry", async (entry: yauzl.Entry) => {
        handle_file: {
            // NOTE: Skip directories
            if (entry.fileName.endsWith(pathSep)) {
                break handle_file;
            }

            await onArchiveFile({
                relativeFilePathInArchive: entry.fileName.split("/").join(pathSep),
                readFile: () => readFile(entry),
                writeFile: params => writeFile(entry, params)
            });
        }

        zipFile.readEntry();
    });

    zipFile.readEntry();

    await dDone.pr;
}
