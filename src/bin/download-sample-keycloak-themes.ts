#!/usr/bin/env node

import { keycloakThemeBuildingDirPath } from "./build-keycloak-theme";
import { downloadAndUnzip } from "./tools/downloadAndUnzip";
import { join as pathJoin } from "path";

export const keycloakBuiltinThemesAndThirdPartyExamplesThemsUrl =
    "https://github.com/garronej/keycloak-react-theming/releases/download/v0.0.1/other_keycloak_thems.zip";

if (require.main === module) {

    downloadAndUnzip({
        "url": keycloakBuiltinThemesAndThirdPartyExamplesThemsUrl,
        "destDirPath": pathJoin(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme")
    });

}

