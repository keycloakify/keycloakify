#!/usr/bin/env node

import { keycloakThemeBuildingDirPath } from "./build-keycloak-theme";
import { downloadAndUnzip } from "./tools/downloadAndUnzip";

export const keycloakBuiltinThemesAndThirdPartyExamplesThemsUrl =
    "https://github.com/garronej/keycloak-react-theming/releases/download/v0.0.1/other_keycloak_thems.zip";

if (require.main === module) {

    console.log("execute!");

    downloadAndUnzip({
        "url": keycloakBuiltinThemesAndThirdPartyExamplesThemsUrl,
        "destDirPath": keycloakThemeBuildingDirPath
    });

}

