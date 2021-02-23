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
console.log("🔏 Building the keycloak theme...⌚");
if (require.main === module) {
    generateKeycloakThemeResources_1.generateKeycloakThemeResources({
        keycloakThemeBuildingDirPath: exports.keycloakThemeBuildingDirPath,
        "reactAppBuildDirPath": path_1.join(reactProjectDirPath, "build"),
        "themeName": parsedPackageJson.name
    });
    var jarFilePath = generateJavaStackFiles_1.generateJavaStackFiles({
        parsedPackageJson: parsedPackageJson,
        keycloakThemeBuildingDirPath: exports.keycloakThemeBuildingDirPath
    }).jarFilePath;
    child_process.execSync("mvn package", { "cwd": exports.keycloakThemeBuildingDirPath });
    generateDebugFiles_1.generateDebugFiles({
        keycloakThemeBuildingDirPath: exports.keycloakThemeBuildingDirPath,
        "packageJsonName": parsedPackageJson.name
    });
    console.log([
        '',
        "\u2705 Your keycloak theme has been generated and bundled into ./" + path_1.relative(reactProjectDirPath, jarFilePath) + " \uD83D\uDE80",
        "It is to be placed in \"/opt/jboss/keycloak/standalone/deployments\" in the container running a jboss/keycloak Docker image. (Tested with 11.0.3)",
        '',
        'Using Helm (https://github.com/codecentric/helm-charts), edit to reflect:',
        '',
        'value.yaml: ',
        '    extraInitContainers: |',
        '        - name: realm-ext-provider',
        '          image: curlimages/curl',
        '          imagePullPolicy: IfNotPresent',
        '          command:',
        '            - sh',
        '          args:',
        '            - -c',
        "            - curl -L -f -S -o /extensions/" + path_1.basename(jarFilePath) + " https://AN.URL.FOR/" + path_1.basename(jarFilePath),
        '          volumeMounts:',
        '            - name: extensions',
        '              mountPath: /extensions',
        '        ',
        '        extraVolumeMounts: |',
        '            - name: extensions',
        '              mountPath: /opt/jboss/keycloak/standalone/deployments',
        '',
        "To enable the theme within keycloak log into the admin console, go to your realm settings, click on the theme tab then select " + parsedPackageJson.name + " ",
        '',
        'To test your theme locally you can spin up a Keycloak container image with the theme loaded by running:',
        '',
        "$ ./" + path_1.relative(reactProjectDirPath, path_1.join(exports.keycloakThemeBuildingDirPath, generateDebugFiles_1.containerLaunchScriptBasename))
    ].join("\n"));
}
//# sourceMappingURL=index.js.map