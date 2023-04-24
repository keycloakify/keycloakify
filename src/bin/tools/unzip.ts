import debug from "debug";
import fsp from "node:fs/promises";
import fs from "fs";
import path from "node:path";
import yauzl from "yauzl";
import stream from "node:stream";
import { promisify } from "node:util";

const log = {
    debug: debug("keycloakify:debug:unzip"),
    trace: debug("keycloakify:trace:unzip"),
}

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

    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
    }

    log.debug(`Unzipping '${file}' to '${targetFolder}'${unzipSubPath ? ` (only ${unzipSubPath})` : ''} ...`)

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
                        log.trace(`Skip file '${entry.fileName}' because its not in '${unzipSubPath}'`)
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
                    log.trace(`Make directory '${target}'`)
                    await fsp.mkdir(target, { recursive: true });

                    zipfile.readEntry();
                    return;
                }

                // Skip existing files
                if (await pathExists(target)) {
                    log.trace(`Skip existing file '${target}'`)
                    zipfile.readEntry();
                    return;
                }

                log.trace(`Extracting '${entry.fileName}' to '${target}' ... `)
                zipfile.openReadStream(entry, async (err, readStream) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    await pipeline(readStream, fs.createWriteStream(target));
                    log.trace(`Extracting '${entry.fileName}' to '${target}' ... done.`)

                    zipfile.readEntry();
                });
            });

            zipfile.once("end", function () {
                zipfile.close();
                log.debug(`Unzipping '${file}' to '${targetFolder}'${unzipSubPath ? ` (only ${unzipSubPath})` : ''} ... done.`);
                resolve();
            });
        });
    });
}
