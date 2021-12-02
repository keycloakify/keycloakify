"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = exports.keycloakThemeBuildingDirPath = void 0;
var generateKeycloakThemeResources_1 = require("./generateKeycloakThemeResources");
var generateJavaStackFiles_1 = require("./generateJavaStackFiles");
var path_1 = require("path");
var child_process = __importStar(require("child_process"));
var generateDebugFiles_1 = require("./generateDebugFiles");
var url_1 = require("url");
var reactProjectDirPath = process.cwd();
var doUseExternalAssets = ((_a = process.argv[2]) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === "--external-assets";
var parsedPackageJson = require((0, path_1.join)(reactProjectDirPath, "package.json"));
exports.keycloakThemeBuildingDirPath = (0, path_1.join)(reactProjectDirPath, "build_keycloak");
function sanitizeThemeName(name) {
    return name
        .replace(/^@(.*)/, "$1")
        .split("/")
        .join("-");
}
function main() {
    var _a, _b, _c, _d;
    console.log("🔏 Building the keycloak theme...⌚");
    var extraPagesId = (_b = (_a = parsedPackageJson["keycloakify"]) === null || _a === void 0 ? void 0 : _a["extraPages"]) !== null && _b !== void 0 ? _b : [];
    var extraThemeProperties = (_d = (_c = parsedPackageJson["keycloakify"]) === null || _c === void 0 ? void 0 : _c["extraThemeProperties"]) !== null && _d !== void 0 ? _d : [];
    var themeName = sanitizeThemeName(parsedPackageJson.name);
    (0, generateKeycloakThemeResources_1.generateKeycloakThemeResources)(__assign(__assign({ keycloakThemeBuildingDirPath: exports.keycloakThemeBuildingDirPath, "reactAppBuildDirPath": (0, path_1.join)(reactProjectDirPath, "build"), themeName: themeName }, (function () {
        var url = (function () {
            var homepage = parsedPackageJson.homepage;
            return homepage === undefined ? undefined : new url_1.URL(homepage);
        })();
        return {
            "urlPathname": url === undefined ? "/" : url.pathname.replace(/([^/])$/, "$1/"),
            "urlOrigin": !doUseExternalAssets
                ? undefined
                : (function () {
                    if (url === undefined) {
                        console.error("ERROR: You must specify 'homepage' in your package.json");
                        process.exit(-1);
                    }
                    return url.origin;
                })(),
        };
    })()), { extraPagesId: extraPagesId, extraThemeProperties: extraThemeProperties, 
        //We have to leave it at that otherwise we break our default theme.
        //Problem is that we can't guarantee that the the old resources common
        //will still be available on the newer keycloak version.
        "keycloakVersion": "11.0.3" }));
    var jarFilePath = (0, generateJavaStackFiles_1.generateJavaStackFiles)({
        version: parsedPackageJson.version,
        themeName: themeName,
        homepage: parsedPackageJson.homepage,
        keycloakThemeBuildingDirPath: exports.keycloakThemeBuildingDirPath,
    }).jarFilePath;
    child_process.execSync("mvn package", {
        "cwd": exports.keycloakThemeBuildingDirPath,
    });
    (0, generateDebugFiles_1.generateDebugFiles)({
        keycloakThemeBuildingDirPath: exports.keycloakThemeBuildingDirPath,
        themeName: themeName,
        "keycloakVersion": "15.0.2",
    });
    console.log([
        "",
        "\u2705 Your keycloak theme has been generated and bundled into ./" + (0, path_1.relative)(reactProjectDirPath, jarFilePath) + " \uD83D\uDE80",
        "It is to be placed in \"/opt/jboss/keycloak/standalone/deployments\" in the container running a jboss/keycloak Docker image.",
        "",
        "Using Helm (https://github.com/codecentric/helm-charts), edit to reflect:",
        "",
        "value.yaml: ",
        "    extraInitContainers: |",
        "        - name: realm-ext-provider",
        "          image: curlimages/curl",
        "          imagePullPolicy: IfNotPresent",
        "          command:",
        "            - sh",
        "          args:",
        "            - -c",
        "            - curl -L -f -S -o /extensions/" + (0, path_1.basename)(jarFilePath) + " https://AN.URL.FOR/" + (0, path_1.basename)(jarFilePath),
        "          volumeMounts:",
        "            - name: extensions",
        "              mountPath: /extensions",
        "        ",
        "        extraVolumeMounts: |",
        "            - name: extensions",
        "              mountPath: /opt/jboss/keycloak/standalone/deployments",
        "    extraEnv: |",
        "    - name: KEYCLOAK_USER",
        "      value: admin",
        "    - name: KEYCLOAK_PASSWORD",
        "      value: xxxxxxxxx",
        "    - name: JAVA_OPTS",
        "      value: -Dkeycloak.profile=preview",
        "",
        "",
        "To test your theme locally, with hot reloading, you can spin up a Keycloak container image with the theme loaded by running:",
        "",
        "\uD83D\uDC49 $ ./" + (0, path_1.relative)(reactProjectDirPath, (0, path_1.join)(exports.keycloakThemeBuildingDirPath, generateDebugFiles_1.containerLaunchScriptBasename)) + " \uD83D\uDC48",
        "",
        'To enable the theme within keycloak log into the admin console ( 👉 http://localhost:8080 username: admin, password: admin 👈), create a realm (called "myrealm" for example),',
        "go to your realm settings, click on the theme tab then select " + themeName + ".",
        "More details: https://www.keycloak.org/getting-started/getting-started-docker",
        "",
        "Once your container is up and configured 👉 http://localhost:8080/auth/realms/myrealm/account 👈",
        "",
    ].join("\n"));
}
exports.main = main;
//# sourceMappingURL=build-keycloak-theme.js.map