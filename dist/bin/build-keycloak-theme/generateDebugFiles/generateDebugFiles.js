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
    var themeName = params.themeName, keycloakThemeBuildingDirPath = params.keycloakThemeBuildingDirPath, keycloakVersion = params.keycloakVersion;
    fs.writeFileSync((0, path_1.join)(keycloakThemeBuildingDirPath, "Dockerfile"), Buffer.from([
        "FROM jboss/keycloak:" + keycloakVersion,
        "",
        "USER root",
        "",
        "WORKDIR /",
        "",
        "ADD configuration /opt/jboss/keycloak/standalone/configuration/",
        "",
        'ENTRYPOINT [ "/opt/jboss/tools/docker-entrypoint.sh" ]',
    ].join("\n"), "utf8"));
    var dockerImage = themeName + "/keycloak-hot-reload";
    var containerName = "keycloak-testing-container";
    fs.writeFileSync((0, path_1.join)(keycloakThemeBuildingDirPath, exports.containerLaunchScriptBasename), Buffer.from([
        "#!/bin/bash",
        "",
        "cd " + keycloakThemeBuildingDirPath,
        "",
        "docker rm " + containerName + " || true",
        "",
        "docker build . -t " + dockerImage,
        "",
        "docker run \\",
        "   -p 8080:8080 \\",
        "   --name " + containerName + " \\",
        "   -e KEYCLOAK_USER=admin \\",
        "   -e KEYCLOAK_PASSWORD=admin \\",
        "   -e JAVA_OPTS=-Dkeycloak.profile=preview \\",
        "   -v " + (0, path_1.join)(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme", themeName) + ":/opt/jboss/keycloak/themes/" + themeName + ":rw \\",
        "   -it " + dockerImage + ":latest",
        "",
    ].join("\n"), "utf8"), { "mode": 493 });
    var standaloneHaFilePath = (0, path_1.join)(keycloakThemeBuildingDirPath, "configuration", "standalone-ha.xml");
    try {
        fs.mkdirSync((0, path_1.dirname)(standaloneHaFilePath));
    }
    catch (_a) { }
    fs.writeFileSync(standaloneHaFilePath, fs
        .readFileSync((0, path_1.join)(__dirname, "standalone-ha_" + keycloakVersion + ".xml"))
        .toString("utf8")
        .replace(new RegExp(["<staticMaxAge>2592000</staticMaxAge>", "<cacheThemes>true</cacheThemes>", "<cacheTemplates>true</cacheTemplates>"].join("\\s*"), "g"), ["<staticMaxAge>-1</staticMaxAge>", "<cacheThemes>false</cacheThemes>", "<cacheTemplates>false</cacheTemplates>"].join("\n")));
}
exports.generateDebugFiles = generateDebugFiles;
//# sourceMappingURL=generateDebugFiles.js.map