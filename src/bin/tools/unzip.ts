import fsp from "node:fs/promises";
import fs from "fs";
import path from "node:path";
import yauzl from "yauzl";
import stream from "node:stream";
import { promisify } from "node:util";

const pipeline = promisify(stream.pipeline);

async function pathExists(path: string) {
    try {
        await fsp.stat(path);
        return true;
    } catch (error) {
        if ((error as { code: string }).code === "ENOENT") {
            return false;
        }
        throw error;
    }
}

export async function unzip(file: string, targetFolder: string, unzipSubPath?: string) {
    // add trailing slash to unzipSubPath and targetFolder
    if (unzipSubPath && (!unzipSubPath.endsWith("/") || !unzipSubPath.endsWith("\\"))) {
        unzipSubPath += "/";
    }

    if (!targetFolder.endsWith("/") || !targetFolder.endsWith("\\")) {
        targetFolder += "/";
    }

    return new Promise<void>((resolve, reject) => {
        yauzl.open(file, { lazyEntries: true }, async (err, zipfile) => {
            if (err) {
                reject(err);
                return;
            }

            zipfile.readEntry();

            zipfile.on("entry", async entry => {
                if (unzipSubPath) {
                    // Skip files outside of the unzipSubPath
                    if (!entry.fileName.startsWith(unzipSubPath)) {
                        zipfile.readEntry();
                        return;
                    }

                    // Remove the unzipSubPath from the file name
                    entry.fileName = entry.fileName.substring(unzipSubPath.length);
                }

                const target = path.join(targetFolder, entry.fileName);

                // Directory file names end with '/'.
                // Note that entries for directories themselves are optional.
                // An entry's fileName implicitly requires its parent directories to exist.
                if (/[\/\\]$/.test(target)) {
                    await fsp.mkdir(target, { recursive: true });

                    zipfile.readEntry();
                    return;
                }

                // Skip existing files
                if (await pathExists(target)) {
                    zipfile.readEntry();
                    return;
                }

                zipfile.openReadStream(entry, async (err, readStream) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    await pipeline(readStream, fs.createWriteStream(target));

                    zipfile.readEntry();
                });
            });

            zipfile.once("end", function () {
                zipfile.close();
                resolve();
            });
        });
    });
}
