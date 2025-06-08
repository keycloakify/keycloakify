import { join as pathJoin, sep as pathSep, relative as pathRelative } from "path";
import { transformCodebase } from "../../src/bin/tools/transformCodebase";
import { getThisCodebaseRootDirPath } from "../../src/bin/tools/getThisCodebaseRootDirPath";
import { WELL_KNOWN_DIRECTORY_BASE_NAME } from "../../src/bin/shared/constants";
import { cacheDirPath } from "../shared/cacheDirPath";
import { getProxyFetchOptions } from "../../src/bin/tools/fetchProxyOptions";
import * as fsPr from "fs/promises";
import { downloadAndExtractArchive } from "../../src/bin/tools/downloadAndExtractArchive";
import {
    KEYCLOAKIFY_LOGIN_UI_ZIP_URL,
    KEYCLOAKIFY_ACCOUNT_MULTI_PAGE_UI_ZIP_URL
} from "../shared/constants";

export async function createPublicKeycloakifyDevResourcesDir() {
    const destDirPath = pathJoin(
        getThisCodebaseRootDirPath(),
        "dist",
        "res",
        "public",
        WELL_KNOWN_DIRECTORY_BASE_NAME.KEYCLOAKIFY_DEV_RESOURCES
    );

    await fsPr.rm(destDirPath, { recursive: true, force: true });

    for (const [url, themeType] of [
        [KEYCLOAKIFY_LOGIN_UI_ZIP_URL, "login"],
        [KEYCLOAKIFY_ACCOUNT_MULTI_PAGE_UI_ZIP_URL, "account"]
    ]) {
        const { extractedDirPath } = await downloadAndExtractArchive({
            cacheDirPath,
            fetchOptions: getProxyFetchOptions({
                npmConfigGetCwd: getThisCodebaseRootDirPath()
            }),
            url,
            uniqueIdOfOnArchiveFile: "extract_keycloak_theme_resources",
            onArchiveFile: async params => {
                const { writeFile } = params;

                let fileRelativePath = params.fileRelativePath
                    .split(pathSep)
                    .splice(1)
                    .join(pathSep);

                fileRelativePath = pathRelative(
                    pathJoin("keycloak-theme", "public", themeType),
                    fileRelativePath
                );

                if (fileRelativePath.startsWith("..")) {
                    return;
                }

                await writeFile({ fileRelativePath });
            }
        });

        transformCodebase({
            srcDirPath: extractedDirPath,
            destDirPath: pathJoin(destDirPath, themeType)
        });
    }
}
