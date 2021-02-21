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
exports.generateJavaStackFiles = void 0;
var url = __importStar(require("url"));
var fs = __importStar(require("fs"));
var path_1 = require("path");
function generateJavaStackFiles(params) {
    var _a = params.parsedPackageJson, name = _a.name, version = _a.version, homepage = _a.homepage, keycloakThemeBuildingDirPath = params.keycloakThemeBuildingDirPath;
    {
        var pomFileCode = (function generatePomFileCode() {
            var groupId = (function () {
                var _a, _b;
                var fallbackGroupId = "there.was.no.homepage.field.in.the.package.json." + name;
                return (!homepage ?
                    fallbackGroupId : (_b = (_a = url.parse(homepage).host) === null || _a === void 0 ? void 0 : _a.split(".").reverse().join(".")) !== null && _b !== void 0 ? _b : fallbackGroupId) + ".keycloak";
            })();
            var artefactId = name + "-keycloak-theme";
            var pomFileCode = [
                "<?xml version=\"1.0\"?>",
                "<project xmlns=\"http://maven.apache.org/POM/4.0.0\"",
                "\txmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"",
                "\txsi:schemaLocation=\"http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd\">",
                "\t<modelVersion>4.0.0</modelVersion>",
                "\t<groupId>" + groupId + "</groupId>",
                "\t<artifactId>" + artefactId + "</artifactId>",
                "\t<version>" + version + "</version>",
                "\t<name>" + artefactId + "</name>",
                "\t<description />",
                "</project>"
            ].join("\n");
            return { pomFileCode: pomFileCode };
        })().pomFileCode;
        fs.writeFileSync(path_1.join(keycloakThemeBuildingDirPath, "pom.xml"), Buffer.from(pomFileCode, "utf8"));
    }
    {
        var themeManifestFilePath = path_1.join(keycloakThemeBuildingDirPath, "src", "main", "resources", "META-INF", "keycloak-themes.json");
        try {
            fs.mkdirSync(path_1.dirname(themeManifestFilePath));
        }
        catch (_b) { }
        fs.writeFileSync(themeManifestFilePath, Buffer.from(JSON.stringify({
            "themes": [
                {
                    "name": name,
                    "types": ["login"]
                }
            ]
        }, null, 2), "utf8"));
    }
}
exports.generateJavaStackFiles = generateJavaStackFiles;
//# sourceMappingURL=generateJavaStackFiles.js.map