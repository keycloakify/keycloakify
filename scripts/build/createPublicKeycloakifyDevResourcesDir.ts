import { join as pathJoin, sep as pathSep, relative as pathRelative } from "path";
import { transformCodebase } from "../../src/bin/tools/transformCodebase";
import { getThisCodebaseRootDirPath } from "../../src/bin/tools/getThisCodebaseRootDirPath";
import { WELL_KNOWN_DIRECTORY_BASE_NAME } from "../../src/bin/shared/constants";
import { cacheDirPath } from "../shared/cacheDirPath";
import { getProxyFetchOptions } from "../../src/bin/tools/fetchProxyOptions";
import * as fsPr from "fs/promises";
import { downloadAndExtractArchive } from "../../src/bin/tools/downloadAndExtractArchive";

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
        [
            "https://github.com/keycloakify/keycloak-login-ui/archive/d5aee279e30f7cc2f37c2910516590ebdad950fc.zip",
            "login"
        ],
        [
            "https://github.com/keycloakify/keycloak-account-multi-page-ui/archive/19bd49bdc1a8b962471e9d2dafdeba1228c3e160.zip",
            "account"
        ]
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
                    pathJoin("keycloak-theme-resources", themeType),
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
