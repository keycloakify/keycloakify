#!/usr/bin/env node

import { keycloakThemeBuildingDirPath } from "./build-keycloak-theme";
import { join as pathJoin } from "path";
import { downloadAndUnzip } from "./tools/downloadAndUnzip"
import type { KeycloakVersion } from "../bin/KeycloakVersion";

export function downloadBuiltinKeycloakTheme(
    params: {
        keycloakVersion: KeycloakVersion;
        destDirPath: string;
    }
) {

    const { keycloakVersion, destDirPath } = params;

    for (const ext of ["", "-community"]) {

        downloadAndUnzip({
            "destDirPath": destDirPath,
            "url": `https://github.com/keycloak/keycloak/archive/refs/tags/${keycloakVersion}.zip`,
            "pathOfDirToExtractInArchive": `keycloak-${keycloakVersion}/themes/src/main/resources${ext}/theme`
        });

    }

}

if (require.main === module) {

    downloadBuiltinKeycloakTheme({
        "keycloakVersion": (() => {

            const keycloakVersion = process.argv[2] as (KeycloakVersion | undefined);

            if (keycloakVersion === undefined) {
                return "15.0.2";
            }

            return keycloakVersion;

        })(),
        "destDirPath": pathJoin(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme")
    });

}

