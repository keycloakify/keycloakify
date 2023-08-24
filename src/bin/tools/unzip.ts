import fsp from "node:fs/promises";
import fs from "fs";
import path from "node:path";
import yauzl from "yauzl";
import yazl from "yazl";
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

// Handlings of non posix path is not implemented correctly
// it work by coincidence. Don't have the time to fix but it should be fixed.
export async function unzip(file: string, targetFolder: string, specificDirsToExtract?: string[]) {
    specificDirsToExtract = specificDirsToExtract?.map(dirPath => {
        if (!dirPath.endsWith("/") || !dirPath.endsWith("\\")) {
            dirPath += "/";
        }

        return dirPath;
    });

    if (!targetFolder.endsWith("/") || !targetFolder.endsWith("\\")) {
        targetFolder += "/";
    }
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
    }

    return new Promise<void>((resolve, reject) => {
        yauzl.open(file, { lazyEntries: true }, async (err, zipfile) => {
            if (err) {
                reject(err);
                return;
            }

            zipfile.readEntry();

            zipfile.on("entry", async entry => {
                if (specificDirsToExtract !== undefined) {
                    const dirPath = specificDirsToExtract.find(dirPath => entry.fileName.startsWith(dirPath));

                    // Skip files outside of the unzipSubPath
                    if (dirPath === undefined) {
                        zipfile.readEntry();
                        return;
                    }

                    // Remove the unzipSubPath from the file name
                    entry.fileName = entry.fileName.substring(dirPath.length);
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

                    await fsp.mkdir(path.dirname(target), { "recursive": true });

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

// NOTE: This code was directly copied from ChatGPT and appears to function as expected.
// However, confidence in its complete accuracy and robustness is limited.
export async function zip(sourceFolder: string, targetZip: string) {
    return new Promise<void>(async (resolve, reject) => {
        const zipfile = new yazl.ZipFile();
        const files: string[] = [];

        // Recursive function to explore directories and their subdirectories
        async function exploreDir(dir: string) {
            const dirContent = await fsp.readdir(dir);
            for (const file of dirContent) {
                const filePath = path.join(dir, file);
                const stat = await fsp.stat(filePath);
                if (stat.isDirectory()) {
                    await exploreDir(filePath);
                } else if (stat.isFile()) {
                    files.push(filePath);
                }
            }
        }

        // Collecting all files to be zipped
        await exploreDir(sourceFolder);

        // Adding files to zip
        for (const file of files) {
            const relativePath = path.relative(sourceFolder, file);
            zipfile.addFile(file, relativePath);
        }

        zipfile.outputStream
            .pipe(fs.createWriteStream(targetZip))
            .on("close", () => resolve())
            .on("error", err => reject(err)); // Listen to error events

        zipfile.end();
    });
}
