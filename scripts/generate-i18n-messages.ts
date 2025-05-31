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

                if (fileRelativePath.startsWith("..")) {
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

    transformCodebase({
        srcDirPath: pathJoin(getThisCodebaseRootDirPath(), "src", "login", "i18n"),
        destDirPath: pathJoin(getThisCodebaseRootDirPath(), "src", "account", "i18n"),
        transformSourceCode: ({ fileRelativePath, sourceCode }) => {
            if (fileRelativePath.startsWith("messages_defaultSet")) {
                return undefined;
            }

            return { modifiedSourceCode: sourceCode };
        }
    });
}
