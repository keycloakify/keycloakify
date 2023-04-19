#!/usr/bin/env node
import { join as pathJoin } from "path";
import { downloadAndUnzip } from "./tools/downloadAndUnzip";
import { promptKeycloakVersion } from "./promptKeycloakVersion";
import { getLogger } from "./tools/logger";
import { readBuildOptions } from "./keycloakify/BuildOptions";

export async function downloadBuiltinKeycloakTheme(params: { keycloakVersion: string; destDirPath: string; isSilent: boolean }) {
    const { keycloakVersion, destDirPath } = params;

    await Promise.all(
        ["", "-community"].map(ext =>
            downloadAndUnzip({
                "destDirPath": destDirPath,
                "url": `https://github.com/keycloak/keycloak/archive/refs/tags/${keycloakVersion}.zip`,
                "pathOfDirToExtractInArchive": `keycloak-${keycloakVersion}/themes/src/main/resources${ext}/theme`
            })
        )
    );
}

async function main() {
    const buildOptions = readBuildOptions({
        "projectDirPath": process.cwd(),
        "processArgv": process.argv.slice(2)
    });

    const logger = getLogger({ "isSilent": buildOptions.isSilent });
    const { keycloakVersion } = await promptKeycloakVersion();

    const destDirPath = pathJoin(buildOptions.keycloakifyBuildDirPath, "src", "main", "resources", "theme");

    logger.log(`Downloading builtins theme of Keycloak ${keycloakVersion} here ${destDirPath}`);

    await downloadBuiltinKeycloakTheme({
        keycloakVersion,
        destDirPath,
        "isSilent": buildOptions.isSilent
    });
}

if (require.main === module) {
    main();
}
