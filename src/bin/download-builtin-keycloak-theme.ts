#!/usr/bin/env node

import { keycloakThemeBuildingDirPath } from "./build-keycloak-theme";
import { join as pathJoin } from "path";
import { downloadAndUnzip } from "./tools/downloadAndUnzip";
import type { KeycloakVersion } from "./KeycloakVersion";

export function downloadBuiltinKeycloakTheme(params: { keycloakVersion: KeycloakVersion; destDirPath: string }) {
    const { keycloakVersion, destDirPath } = params;

    for (const ext of ["", "-community"]) {
        downloadAndUnzip({
            "destDirPath": destDirPath,
            "url": `https://github.com/keycloak/keycloak/archive/refs/tags/${keycloakVersion}.zip`,
            "pathOfDirToExtractInArchive": `keycloak-${keycloakVersion}/themes/src/main/resources${ext}/theme`,
        });
    }
}

if (require.main === module) {
    const keycloakVersion = (() => {
        const keycloakVersion = process.argv[2] as KeycloakVersion | undefined;

        if (keycloakVersion === undefined) {
            return "11.0.3";
        }

        return keycloakVersion;
    })();

    const destDirPath = pathJoin(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme");

    console.log(`Downloading builtins theme of Keycloak ${keycloakVersion} here ${destDirPath}`);

    downloadBuiltinKeycloakTheme({
        keycloakVersion,
        destDirPath,
    });
}
