import { join as pathJoin, sep as pathSep, relative as pathRelative } from "path";
import { getThisCodebaseRootDirPath } from "../src/bin/tools/getThisCodebaseRootDirPath";
import { transformCodebase } from "../src/bin/tools/transformCodebase";
import { downloadAndExtractArchive } from "../src/bin/tools/downloadAndExtractArchive";
import { cacheDirPath } from "./shared/cacheDirPath";
import { getProxyFetchOptions } from "../src/bin/tools/fetchProxyOptions";
import {
    KEYCLOAKIFY_LOGIN_UI_ZIP_URL,
    KEYCLOAKIFY_ACCOUNT_MULTI_PAGE_UI_ZIP_URL
} from "./shared/constants";

if (require.main === module) {
    generateI18nMessages();
}

async function generateI18nMessages() {
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
