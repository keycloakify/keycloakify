#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.keycloakThemeBuildingDirPath = void 0;
var generateKeycloakThemeResources_1 = require("./generateKeycloakThemeResources");
var generateJavaStackFiles_1 = require("./generateJavaStackFiles");
var path_1 = require("path");
var child_process = __importStar(require("child_process"));
var generateDebugFiles_1 = require("./generateDebugFiles");
var reactProjectDirPath = process.cwd();
var parsedPackageJson = require(path_1.join(reactProjectDirPath, "package.json"));
exports.keycloakThemeBuildingDirPath = path_1.join(reactProjectDirPath, "build_keycloak");
if (require.main === module) {
    generateKeycloakThemeResources_1.generateKeycloakThemeResources({
        keycloakThemeBuildingDirPath: exports.keycloakThemeBuildingDirPath,
        "reactAppBuildDirPath": path_1.join(reactProjectDirPath, "build"),
        "themeName": parsedPackageJson.name
    });
    generateJavaStackFiles_1.generateJavaStackFiles({
        parsedPackageJson: parsedPackageJson,
        keycloakThemeBuildingDirPath: exports.keycloakThemeBuildingDirPath
    });
    child_process.execSync("mvn package", { "cwd": exports.keycloakThemeBuildingDirPath });
    generateDebugFiles_1.generateDebugFiles({
        keycloakThemeBuildingDirPath: exports.keycloakThemeBuildingDirPath,
        "packageJsonName": parsedPackageJson.name
    });
}
//# sourceMappingURL=index.js.map