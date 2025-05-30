import { join as pathJoin, sep as pathSep, relative as pathRelative } from "path";
import { getThisCodebaseRootDirPath } from "../src/bin/tools/getThisCodebaseRootDirPath";
import { transformCodebase } from "../src/bin/tools/transformCodebase";
import { downloadAndExtractArchive } from "../src/bin/tools/downloadAndExtractArchive";
import { cacheDirPath } from "./shared/cacheDirPath";
import { getProxyFetchOptions } from "../src/bin/tools/fetchProxyOptions";

if (require.main === module) {
    generateI18nMessages();
}

async function generateI18nMessages() {
    for (const [url, themeType] of [
        [
            "https://github.com/keycloakify/keycloak-login-ui/archive/1c64024a06b5f8deae3eded68863268ff9791e60.zip",
            "login"
        ],
        [
            "https://github.com/keycloakify/keycloak-account-multi-page-ui/archive/718b76c9b63ef0448c3318fce78b5e7c92ea23b8.zip",
            "account"
        ]
    ]) {
        const { extractedDirPath } = await downloadAndExtractArchive({
            cacheDirPath,
            fetchOptions: getProxyFetchOptions({
                npmConfigGetCwd: getThisCodebaseRootDirPath()
            }),
            url,
            uniqueIdOfOnArchiveFile: "extract_messages_defaultSet",
            onArchiveFile: async params => {
                const { writeFile } = params;

                let fileRelativePath = params.fileRelativePath
                    .split(pathSep)
                    .splice(1)
                    .join(pathSep);

                fileRelativePath = pathRelative(
                    pathJoin("src", "core", "i18n", "messages_defaultSet"),
                    fileRelativePath
                );

                if (fileRelativePath === "..") {
                    return;
                }

                await writeFile({ fileRelativePath });
            }
        });

        transformCodebase({
            srcDirPath: extractedDirPath,
            destDirPath: pathJoin(
                getThisCodebaseRootDirPath(),
                "src",
                themeType,
                "i18n",
                "messages_defaultSet"
            )
        });
    }
}
