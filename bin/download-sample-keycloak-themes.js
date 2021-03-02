#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keycloakBuiltinThemesAndThirdPartyExamplesThemsUrl = void 0;
var build_keycloak_theme_1 = require("./build-keycloak-theme");
var downloadAndUnzip_1 = require("./tools/downloadAndUnzip");
var path_1 = require("path");
exports.keycloakBuiltinThemesAndThirdPartyExamplesThemsUrl = "https://github.com/garronej/keycloak-react-theming/releases/download/v0.0.1/other_keycloak_thems.zip";
if (require.main === module) {
    downloadAndUnzip_1.downloadAndUnzip({
        "url": exports.keycloakBuiltinThemesAndThirdPartyExamplesThemsUrl,
        "destDirPath": path_1.join(build_keycloak_theme_1.keycloakThemeBuildingDirPath, "src", "main", "resources", "theme")
    });
}
//# sourceMappingURL=download-sample-keycloak-themes.js.map