#!/usr/bin/env node

import { keycloakThemeBuildingDirPath } from "./keycloakify";
import { join as pathJoin } from "path";
import { downloadAndUnzip } from "./tools/downloadAndUnzip";
import { promptKeycloakVersion } from "./promptKeycloakVersion";

export function downloadBuiltinKeycloakTheme(params: { keycloakVersion: string; destDirPath: string }) {
    const { keycloakVersion, destDirPath } = params;

    for (const ext of ["", "-community"]) {
        downloadAndUnzip({
            "destDirPath": destDirPath,
            "url": `https://github.com/keycloak/keycloak/archive/refs/tags/${keycloakVersion}.zip`,
            "pathOfDirToExtractInArchive": `keycloak-${keycloakVersion}/themes/src/main/resources${ext}/theme`,
            "cacheDirPath": pathJoin(keycloakThemeBuildingDirPath, ".cache")
        });
    }
}

if (require.main === module) {
    (async () => {
        const { keycloakVersion } = await promptKeycloakVersion();

        const destDirPath = pathJoin(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme");

        console.log(`Downloading builtins theme of Keycloak ${keycloakVersion} here ${destDirPath}`);

        downloadBuiltinKeycloakTheme({
            keycloakVersion,
            destDirPath
        });
    })();
}
