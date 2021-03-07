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
exports.generateDebugFiles = exports.containerLaunchScriptBasename = void 0;
var fs = __importStar(require("fs"));
var path_1 = require("path");
exports.containerLaunchScriptBasename = "start_keycloak_testing_container.sh";
/** Files for being able to run a hot reload keycloak container */
function generateDebugFiles(params) {
    var packageJsonName = params.packageJsonName, keycloakThemeBuildingDirPath = params.keycloakThemeBuildingDirPath;
    fs.writeFileSync(path_1.join(keycloakThemeBuildingDirPath, "Dockerfile"), Buffer.from([
        "FROM jboss/keycloak:11.0.3",
        "",
        "USER root",
        "",
        "WORKDIR /",
        "",
        "ADD configuration /opt/jboss/keycloak/standalone/configuration/",
        "",
        'ENTRYPOINT [ "/opt/jboss/tools/docker-entrypoint.sh" ]',
    ].join("\n"), "utf8"));
    var dockerImage = packageJsonName + "/keycloak-hot-reload";
    var containerName = "keycloak-testing-container";
    fs.writeFileSync(path_1.join(keycloakThemeBuildingDirPath, exports.containerLaunchScriptBasename), Buffer.from([
        "#!/bin/bash",
        "",
        "cd " + keycloakThemeBuildingDirPath,
        "",
        "docker rm " + containerName + " || true",
        "",
        "docker build . -t " + dockerImage,
        "",
        "docker run \\",
        "	-p 8080:8080 \\",
        "\t--name " + containerName + " \\",
        "	-e KEYCLOAK_USER=admin \\",
        "	-e KEYCLOAK_PASSWORD=admin \\",
        "\t-v " + path_1.join(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme", packageJsonName) + ":/opt/jboss/keycloak/themes/" + packageJsonName + ":rw \\",
        "\t-it " + dockerImage + ":latest",
        ""
    ].join("\n"), "utf8"), { "mode": 493 });
    var standaloneHaFilePath = path_1.join(keycloakThemeBuildingDirPath, "configuration", "standalone-ha.xml");
    try {
        fs.mkdirSync(path_1.dirname(standaloneHaFilePath));
    }
    catch (_a) { }
    fs.writeFileSync(standaloneHaFilePath, fs.readFileSync(path_1.join(__dirname, path_1.basename(standaloneHaFilePath))));
}
exports.generateDebugFiles = generateDebugFiles;
//# sourceMappingURL=index.js.map