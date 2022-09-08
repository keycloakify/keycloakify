#!/usr/bin/env node

import { keycloakThemeBuildingDirPath } from "./keycloakify";
import { join as pathJoin } from "path";
import { downloadAndUnzip } from "./tools/downloadAndUnzip";
import { promptKeycloakVersion } from "./promptKeycloakVersion";
import { getCliOptions } from "./tools/cliOptions";
import { getLogger } from "./tools/logger";

export function downloadBuiltinKeycloakTheme(params: { keycloakVersion: string; destDirPath: string; isSilent: boolean }) {
    const { keycloakVersion, destDirPath, isSilent } = params;

    for (const ext of ["", "-community"]) {
        downloadAndUnzip({
            "destDirPath": destDirPath,
            "url": `https://github.com/keycloak/keycloak/archive/refs/tags/${keycloakVersion}.zip`,
            "pathOfDirToExtractInArchive": `keycloak-${keycloakVersion}/themes/src/main/resources${ext}/theme`,
            "cacheDirPath": pathJoin(keycloakThemeBuildingDirPath, ".cache"),
            isSilent
        });
    }
}

if (require.main === module) {
    (async () => {
        const { isSilent } = getCliOptions(process.argv.slice(2));
        const logger = getLogger({ isSilent });
        const { keycloakVersion } = await promptKeycloakVersion();

        const destDirPath = pathJoin(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme");

        logger.log(`Downloading builtins theme of Keycloak ${keycloakVersion} here ${destDirPath}`);

        downloadBuiltinKeycloakTheme({
            keycloakVersion,
            destDirPath,
            isSilent
        });
    })();
}
