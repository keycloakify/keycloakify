#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builtinThemesUrl = void 0;
var build_keycloak_theme_1 = require("./build-keycloak-theme");
var downloadAndUnzip_1 = require("./tools/downloadAndUnzip");
var path_1 = require("path");
exports.builtinThemesUrl = "https://github.com/garronej/keycloakify/releases/download/v0.0.1/keycloak_11.0.3_builtin_themes.zip";
if (require.main === module) {
    downloadAndUnzip_1.downloadAndUnzip({
        "url": exports.builtinThemesUrl,
        "destDirPath": path_1.join(build_keycloak_theme_1.keycloakThemeBuildingDirPath, "src", "main", "resources", "theme")
    });
}
//# sourceMappingURL=install-builtin-keycloak-themes.js.map