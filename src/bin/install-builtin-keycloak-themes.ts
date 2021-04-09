#!/usr/bin/env node

import { keycloakThemeBuildingDirPath } from "./build-keycloak-theme";
import { downloadAndUnzip } from "./tools/downloadAndUnzip";
import { join as pathJoin } from "path";

export const builtinThemesUrl =
    "https://github.com/garronej/keycloakify/releases/download/v0.0.1/keycloak_11.0.3_builtin_themes_with_light_mods.zip";

if (require.main === module) {

    downloadAndUnzip({
        "url": builtinThemesUrl,
        "destDirPath": pathJoin(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme")
    });

}

