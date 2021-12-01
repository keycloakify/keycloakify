#!/usr/bin/env node
"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadBuiltinKeycloakTheme = void 0;
var build_keycloak_theme_1 = require("./build-keycloak-theme");
var path_1 = require("path");
var downloadAndUnzip_1 = require("./tools/downloadAndUnzip");
function downloadBuiltinKeycloakTheme(params) {
    var e_1, _a;
    var keycloakVersion = params.keycloakVersion, destDirPath = params.destDirPath;
    try {
        for (var _b = __values(["", "-community"]), _c = _b.next(); !_c.done; _c = _b.next()) {
            var ext = _c.value;
            (0, downloadAndUnzip_1.downloadAndUnzip)({
                "destDirPath": destDirPath,
                "url": "https://github.com/keycloak/keycloak/archive/refs/tags/" + keycloakVersion + ".zip",
                "pathOfDirToExtractInArchive": "keycloak-" + keycloakVersion + "/themes/src/main/resources" + ext + "/theme",
            });
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
exports.downloadBuiltinKeycloakTheme = downloadBuiltinKeycloakTheme;
if (require.main === module) {
    var keycloakVersion = (function () {
        var keycloakVersion = process.argv[2];
        if (keycloakVersion === undefined) {
            return "15.0.2";
        }
        return keycloakVersion;
    })();
    var destDirPath = (0, path_1.join)(build_keycloak_theme_1.keycloakThemeBuildingDirPath, "src", "main", "resources", "theme");
    console.log("Downloading builtins theme of Keycloak " + keycloakVersion + " here " + destDirPath);
    downloadBuiltinKeycloakTheme({
        keycloakVersion: keycloakVersion,
        destDirPath: destDirPath,
    });
}
//# sourceMappingURL=download-builtin-keycloak-theme.js.map