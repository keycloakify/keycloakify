import fetch from "make-fetch-happen";
import { mkdir, unlink, writeFile, readdir } from "fs/promises";
import { dirname as pathDirname, join as pathJoin } from "path";
import { assert } from "tsafe/assert";
import { extractArchive } from "../extractArchive";
import { existsAsync } from "../fs.existsAsync";
import { getProxyFetchOptions } from "./fetchProxyOptions";
import * as crypto from "crypto";

export async function downloadAndExtractArchive(params: {
    url: string;
    uniqueIdOfOnOnArchiveFile: string;
    onArchiveFile: (params: {
        fileRelativePath: string;
        readFile: () => Promise<Buffer>;
        writeFile: (params: {
            fileRelativePath: string;
            modifiedData?: Buffer;
        }) => Promise<void>;
    }) => Promise<void>;
    cacheDirPath: string;
    npmWorkspaceRootDirPath: string;
}): Promise<{ extractedDirPath: string }> {
    const {
        url,
        uniqueIdOfOnOnArchiveFile,
        onArchiveFile,
        cacheDirPath,
        npmWorkspaceRootDirPath
    } = params;

    const archiveFileBasename = url.split("?")[0].split("/").reverse()[0];

    const archiveFilePath = pathJoin(cacheDirPath, archiveFileBasename);

    download: {
        if (await existsAsync(archiveFilePath)) {
            break download;
        }

        await mkdir(pathDirname(archiveFilePath), { recursive: true });

        const response = await fetch(
            url,
            await getProxyFetchOptions({ npmWorkspaceRootDirPath })
        );

        response.body?.setMaxListeners(Number.MAX_VALUE);
        assert(typeof response.body !== "undefined" && response.body != null);

        await writeFile(archiveFilePath, response.body);
    }

    const extractDirBasename = `${archiveFileBasename.split(".")[0]}_${uniqueIdOfOnOnArchiveFile}_${crypto
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
            .map(basename => unlink(pathJoin(cacheDirPath, basename)))
    );

    const extractedDirPath = pathJoin(cacheDirPath, extractDirBasename);

    extract_and_transform: {
        if (await existsAsync(extractedDirPath)) {
            break extract_and_transform;
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
    }

    return { extractedDirPath };
}
