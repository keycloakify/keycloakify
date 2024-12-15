import { downloadAndExtractArchive } from "../../src/bin/tools/downloadAndExtractArchive";
import { cacheDirPath } from "../shared/cacheDirPath";
import { getProxyFetchOptions } from "../../src/bin/tools/fetchProxyOptions";
import { getThisCodebaseRootDirPath } from "../../src/bin/tools/getThisCodebaseRootDirPath";
import { existsAsync } from "../../src/bin/tools/fs.existsAsync";
import * as fs from "fs/promises";
import {
    KEYCLOAKIFY_LOGGING_VERSION,
    KEYCLOAKIFY_LOGIN_JAR_BASENAME
} from "../../src/bin/shared/constants";
import { join as pathJoin } from "path";

export async function downloadKeycloakifyLogging(params: { distDirPath: string }) {
    const { distDirPath } = params;

    const jarFilePath = pathJoin(
        distDirPath,
        "src",
        "bin",
        "start-keycloak",
        KEYCLOAKIFY_LOGIN_JAR_BASENAME
    );

    if (await existsAsync(jarFilePath)) {
        return;
    }

    const { archiveFilePath } = await downloadAndExtractArchive({
        cacheDirPath,
        fetchOptions: getProxyFetchOptions({
            npmConfigGetCwd: getThisCodebaseRootDirPath()
        }),
        url: `https://github.com/keycloakify/keycloakify-logging/releases/download/${KEYCLOAKIFY_LOGGING_VERSION}/keycloakify-logging-${KEYCLOAKIFY_LOGGING_VERSION}.jar`,
        uniqueIdOfOnArchiveFile: "no extraction",
        onArchiveFile: async () => {}
    });

    await fs.cp(archiveFilePath, jarFilePath);
}
