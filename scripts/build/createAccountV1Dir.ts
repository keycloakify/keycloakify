import { join as pathJoin, sep as pathSep, relative as pathRelative } from "path";
import { getThisCodebaseRootDirPath } from "../../src/bin/tools/getThisCodebaseRootDirPath";
import { downloadAndExtractArchive } from "../../src/bin/tools/downloadAndExtractArchive";
import { getProxyFetchOptions } from "../../src/bin/tools/fetchProxyOptions";
import { transformCodebase } from "../../src/bin/tools/transformCodebase";
import { cacheDirPath } from "../shared/cacheDirPath";
import * as fsPr from "fs/promises";
import { KEYCLOAKIFY_ACCOUNT_MULTI_PAGE_UI_ZIP_URL } from "../shared/constants";

export async function createAccountV1Dir() {
    const destDirPath = pathJoin(
        getThisCodebaseRootDirPath(),
        "dist",
        "res",
        "account-v1"
    );

    await fsPr.rm(destDirPath, { recursive: true, force: true });

    const { extractedDirPath } = await downloadAndExtractArchive({
        cacheDirPath,
        fetchOptions: getProxyFetchOptions({
            npmConfigGetCwd: getThisCodebaseRootDirPath()
        }),
        url: KEYCLOAKIFY_ACCOUNT_MULTI_PAGE_UI_ZIP_URL,
        uniqueIdOfOnArchiveFile: "extract_account_v1",
        onArchiveFile: async params => {
            const { writeFile } = params;

            let fileRelativePath = params.fileRelativePath
                .split(pathSep)
                .splice(1)
                .join(pathSep);

            fileRelativePath = pathRelative("account-v1", fileRelativePath);

            if (fileRelativePath.startsWith("..")) {
                return;
            }

            await writeFile({ fileRelativePath });
        }
    });

    transformCodebase({
        srcDirPath: extractedDirPath,
        destDirPath
    });
}
