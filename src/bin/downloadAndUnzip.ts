import { createHash } from "crypto";
import { mkdir, writeFile, unlink } from "fs/promises";
import fetch from "make-fetch-happen";
import { dirname as pathDirname, join as pathJoin, basename as pathBasename } from "path";
import { assert } from "tsafe/assert";
import { transformCodebase } from "./tools/transformCodebase";
import { unzip, zip } from "./tools/unzip";
import { rm } from "./tools/fs.rm";
import * as child_process from "child_process";
import { existsAsync } from "./tools/fs.existsAsync";
import type { BuildOptions } from "./keycloakify/buildOptions";
import { getProxyFetchOptions } from "./tools/fetchProxyOptions";

export type BuildOptionsLike = {
    cacheDirPath: string;
    npmWorkspaceRootDirPath: string;
};

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export async function downloadAndUnzip(params: {
    url: string;
    destDirPath: string;
    specificDirsToExtract?: string[];
    preCacheTransform?: {
        actionCacheId: string;
        action: (params: { destDirPath: string }) => Promise<void>;
    };
    buildOptions: BuildOptionsLike;
}) {
    const { url, destDirPath, specificDirsToExtract, preCacheTransform, buildOptions } = params;

    const { extractDirPath, zipFilePath } = (() => {
        const zipFileBasenameWithoutExt = generateFileNameFromURL({
            url,
            "preCacheTransform":
                preCacheTransform === undefined
                    ? undefined
                    : {
                          "actionCacheId": preCacheTransform.actionCacheId,
                          "actionFootprint": preCacheTransform.action.toString()
                      }
        });

        const zipFilePath = pathJoin(buildOptions.cacheDirPath, `${zipFileBasenameWithoutExt}.zip`);
        const extractDirPath = pathJoin(buildOptions.cacheDirPath, `tmp_unzip_${zipFileBasenameWithoutExt}`);

        return { zipFilePath, extractDirPath };
    })();

    download_zip_and_transform: {
        if (await existsAsync(zipFilePath)) {
            break download_zip_and_transform;
        }

        const { response, isFromRemoteCache } = await (async () => {
            const proxyFetchOptions = await getProxyFetchOptions({
                "npmWorkspaceRootDirPath": buildOptions.npmWorkspaceRootDirPath
            });

            const response = await fetch(
                `https://github.com/keycloakify/keycloakify/releases/download/v0.0.1/${pathBasename(zipFilePath)}`,
                proxyFetchOptions
            );

            if (response.status === 200) {
                return {
                    response,
                    "isFromRemoteCache": true
                };
            }

            return {
                "response": await fetch(url, proxyFetchOptions),
                "isFromRemoteCache": false
            };
        })();

        await mkdir(pathDirname(zipFilePath), { "recursive": true });

        /**
         * The correct way to fix this is to upgrade node-fetch beyond 3.2.5
         * (see https://github.com/node-fetch/node-fetch/issues/1295#issuecomment-1144061991.)
         * Unfortunately, octokit (a dependency of keycloakify) also uses node-fetch, and
         * does not support node-fetch 3.x. So we stick around with this band-aid until
         * octokit upgrades.
         */
        response.body?.setMaxListeners(Number.MAX_VALUE);
        assert(typeof response.body !== "undefined" && response.body != null);

        await writeFile(zipFilePath, response.body);

        if (isFromRemoteCache) {
            break download_zip_and_transform;
        }

        if (specificDirsToExtract === undefined && preCacheTransform === undefined) {
            break download_zip_and_transform;
        }

        await unzip(zipFilePath, extractDirPath, specificDirsToExtract);

        try {
            await preCacheTransform?.action({
                "destDirPath": extractDirPath
            });
        } catch (error) {
            await Promise.all([rm(extractDirPath, { "recursive": true }), unlink(zipFilePath)]);

            throw error;
        }

        await unlink(zipFilePath);

        await zip(extractDirPath, zipFilePath);

        await rm(extractDirPath, { "recursive": true });

        upload_to_remot_cache_if_admin: {
            const githubToken = process.env["KEYCLOAKIFY_ADMIN_GITHUB_PERSONAL_ACCESS_TOKEN"];

            if (githubToken === undefined) {
                break upload_to_remot_cache_if_admin;
            }

            console.log("uploading to remote cache");

            try {
                child_process.execSync(`which putasset`);
            } catch {
                child_process.execSync(`npm install -g putasset`);
            }

            try {
                child_process.execFileSync("putasset", [
                    "--owner",
                    "keycloakify",
                    "--repo",
                    "keycloakify",
                    "--tag",
                    "v0.0.1",
                    "--filename",
                    zipFilePath,
                    "--token",
                    githubToken
                ]);
            } catch {
                console.log("upload failed, asset probably already exists in remote cache");
            }
        }
    }

    await unzip(zipFilePath, extractDirPath);

    transformCodebase({
        "srcDirPath": extractDirPath,
        "destDirPath": destDirPath
    });

    await rm(extractDirPath, { "recursive": true });
}

function generateFileNameFromURL(params: {
    url: string;
    preCacheTransform:
        | {
              actionCacheId: string;
              actionFootprint: string;
          }
        | undefined;
}): string {
    const { preCacheTransform } = params;

    // Parse the URL
    const url = new URL(params.url);

    // Extract pathname and remove leading slashes
    let fileName = url.pathname.replace(/^\//, "").replace(/\//g, "_");

    // Optionally, add query parameters replacing special characters
    if (url.search) {
        fileName += url.search.replace(/[&=?]/g, "-");
    }

    // Replace any characters that are not valid in filenames
    fileName = fileName.replace(/[^a-zA-Z0-9-_]/g, "");

    // Trim or pad the fileName to a specific length
    fileName = fileName.substring(0, 50);

    add_pre_cache_transform: {
        if (preCacheTransform === undefined) {
            break add_pre_cache_transform;
        }

        // Sanitize actionCacheId the same way as other components
        const sanitizedActionCacheId = preCacheTransform.actionCacheId.replace(/[^a-zA-Z0-9-_]/g, "_");

        fileName += `_${sanitizedActionCacheId}_${createHash("sha256").update(preCacheTransform.actionFootprint).digest("hex").substring(0, 5)}`;
    }

    return fileName;
}
