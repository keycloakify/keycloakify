#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keycloakBuiltinThemesAndThirdPartyExamplesThemsUrl = void 0;
var build_keycloak_theme_1 = require("./build-keycloak-theme");
var downloadAndUnzip_1 = require("./tools/downloadAndUnzip");
exports.keycloakBuiltinThemesAndThirdPartyExamplesThemsUrl = "https://github.com/garronej/keycloak-react-theming/releases/download/v0.0.1/other_keycloak_thems.zip";
if (require.main === module) {
    console.log("execute!");
    downloadAndUnzip_1.downloadAndUnzip({
        "url": exports.keycloakBuiltinThemesAndThirdPartyExamplesThemsUrl,
        "destDirPath": build_keycloak_theme_1.keycloakThemeBuildingDirPath
    });
}
//# sourceMappingURL=download-sample-keycloak-themes.js.map