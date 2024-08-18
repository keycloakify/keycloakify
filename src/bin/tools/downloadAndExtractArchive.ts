import fetch, { type FetchOptions } from "make-fetch-happen";
import { mkdir, unlink, writeFile, readdir, readFile } from "fs/promises";
import { dirname as pathDirname, join as pathJoin, basename as pathBasename } from "path";
import { assert } from "tsafe/assert";
import { extractArchive } from "./extractArchive";
import { existsAsync } from "./fs.existsAsync";
import * as crypto from "crypto";
import { rm } from "./fs.rm";
import * as fsPr from "fs/promises";

export async function downloadAndExtractArchive(params: {
    urlOrPath: string;
    uniqueIdOfOnArchiveFile: string;
    onArchiveFile: (params: {
        fileRelativePath: string;
        readFile: () => Promise<Buffer>;
        writeFile: (params: {
            fileRelativePath: string;
            modifiedData?: Buffer;
        }) => Promise<void>;
    }) => Promise<void>;
    cacheDirPath: string;
    fetchOptions: FetchOptions | undefined;
}): Promise<{ extractedDirPath: string; archiveFilePath: string }> {
    const {
        urlOrPath,
        uniqueIdOfOnArchiveFile,
        onArchiveFile,
        cacheDirPath,
        fetchOptions
    } = params;

    const isUrl = /^https?:\/\//.test(urlOrPath);

    const archiveFileBasename = isUrl
        ? urlOrPath.split("?")[0].split("/").reverse()[0]
        : pathBasename(urlOrPath);

    const archiveFilePath = pathJoin(cacheDirPath, archiveFileBasename);

    download: {
        await mkdir(pathDirname(archiveFilePath), { recursive: true });

        if (!isUrl) {
            await fsPr.copyFile(urlOrPath, archiveFilePath);

            break download;
        }

        const url = urlOrPath;

        if (await existsAsync(archiveFilePath)) {
            const isDownloaded = await SuccessTracker.getIsDownloaded({
                cacheDirPath,
                archiveFileBasename
            });

            if (isDownloaded) {
                break download;
            }

            await unlink(archiveFilePath);

            await SuccessTracker.removeFromDownloaded({
                cacheDirPath,
                archiveFileBasename
            });
        }

        const response = await fetch(url, fetchOptions);

        response.body?.setMaxListeners(Number.MAX_VALUE);
        assert(typeof response.body !== "undefined" && response.body != null);

        await writeFile(archiveFilePath, response.body);

        await SuccessTracker.markAsDownloaded({
            cacheDirPath,
            archiveFileBasename
        });
    }

    const extractDirBasename = `${archiveFileBasename.replace(/\.([^.]+)$/, (...[, ext]) => `_${ext}`)}_${uniqueIdOfOnArchiveFile}_${crypto
        .createHash("sha256")
        .update(onArchiveFile.toString())
        .digest("hex")
        .substring(0, 5)}`;

    await Promise.all(
        (await readdir(cacheDirPath))
            .filter(
                (() => {
                    const prefix = extractDirBasename
                        .split("_")
                        .reverse()
                        .slice(1)
                        .reverse()
                        .join("_");

                    return basename =>
                        basename !== extractDirBasename && basename.startsWith(prefix);
                })()
            )
            .map(async extractDirBasename => {
                await rm(pathJoin(cacheDirPath, extractDirBasename), {
                    recursive: true
                });
                await SuccessTracker.removeFromExtracted({
                    cacheDirPath,
                    extractDirBasename
                });
            })
    );

    const extractedDirPath = pathJoin(cacheDirPath, extractDirBasename);

    extract_and_transform: {
        if (await existsAsync(extractedDirPath)) {
            const isExtracted = await SuccessTracker.getIsExtracted({
                cacheDirPath,
                extractDirBasename
            });

            if (isExtracted) {
                break extract_and_transform;
            }

            await rm(extractedDirPath, { recursive: true });

            await SuccessTracker.removeFromExtracted({
                cacheDirPath,
                extractDirBasename
            });
        }

        await extractArchive({
            archiveFilePath,
            onArchiveFile: async ({ relativeFilePathInArchive, readFile, writeFile }) =>
                onArchiveFile({
                    fileRelativePath: relativeFilePathInArchive,
                    readFile,
                    writeFile: ({ fileRelativePath, modifiedData }) =>
                        writeFile({
                            filePath: pathJoin(extractedDirPath, fileRelativePath),
                            modifiedData
                        })
                })
        });

        await SuccessTracker.markAsExtracted({
            cacheDirPath,
            extractDirBasename
        });
    }

    return { extractedDirPath, archiveFilePath };
}

type SuccessTracker = {
    archiveFileBasenames: string[];
    extractDirBasenames: string[];
};

namespace SuccessTracker {
    async function read(params: { cacheDirPath: string }): Promise<SuccessTracker> {
        const { cacheDirPath } = params;

        const filePath = pathJoin(cacheDirPath, "downloadAndExtractArchive.json");

        if (!(await existsAsync(filePath))) {
            return { archiveFileBasenames: [], extractDirBasenames: [] };
        }

        return JSON.parse((await readFile(filePath)).toString("utf8"));
    }

    async function write(params: {
        cacheDirPath: string;
        successTracker: SuccessTracker;
    }) {
        const { cacheDirPath, successTracker } = params;

        const filePath = pathJoin(cacheDirPath, "downloadAndExtractArchive.json");

        {
            const dirPath = pathDirname(filePath);

            if (!(await existsAsync(dirPath))) {
                await mkdir(dirPath, { recursive: true });
            }
        }

        await writeFile(filePath, JSON.stringify(successTracker));
    }

    export async function markAsDownloaded(params: {
        cacheDirPath: string;
        archiveFileBasename: string;
    }) {
        const { cacheDirPath, archiveFileBasename } = params;

        const successTracker = await read({ cacheDirPath });

        successTracker.archiveFileBasenames.push(archiveFileBasename);

        await write({ cacheDirPath, successTracker });
    }

    export async function getIsDownloaded(params: {
        cacheDirPath: string;
        archiveFileBasename: string;
    }): Promise<boolean> {
        const { cacheDirPath, archiveFileBasename } = params;

        const successTracker = await read({ cacheDirPath });

        return successTracker.archiveFileBasenames.includes(archiveFileBasename);
    }

    export async function removeFromDownloaded(params: {
        cacheDirPath: string;
        archiveFileBasename: string;
    }) {
        const { cacheDirPath, archiveFileBasename } = params;

        const successTracker = await read({ cacheDirPath });

        successTracker.archiveFileBasenames = successTracker.archiveFileBasenames.filter(
            basename => basename !== archiveFileBasename
        );

        await write({ cacheDirPath, successTracker });
    }

    export async function markAsExtracted(params: {
        cacheDirPath: string;
        extractDirBasename: string;
    }) {
        const { cacheDirPath, extractDirBasename } = params;

        const successTracker = await read({ cacheDirPath });

        successTracker.extractDirBasenames.push(extractDirBasename);

        await write({ cacheDirPath, successTracker });
    }

    export async function getIsExtracted(params: {
        cacheDirPath: string;
        extractDirBasename: string;
    }): Promise<boolean> {
        const { cacheDirPath, extractDirBasename } = params;

        const successTracker = await read({ cacheDirPath });

        return successTracker.extractDirBasenames.includes(extractDirBasename);
    }

    export async function removeFromExtracted(params: {
        cacheDirPath: string;
        extractDirBasename: string;
    }) {
        const { cacheDirPath, extractDirBasename } = params;

        const successTracker = await read({ cacheDirPath });

        successTracker.extractDirBasenames = successTracker.extractDirBasenames.filter(
            basename => basename !== extractDirBasename
        );

        await write({ cacheDirPath, successTracker });
    }
}
