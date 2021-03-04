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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKeycloakThemeResources = void 0;
var transformCodebase_1 = require("../tools/transformCodebase");
var fs = __importStar(require("fs"));
var path_1 = require("path");
var replaceImportFromStatic_1 = require("./replaceImportFromStatic");
var generateFtl_1 = require("./generateFtl");
var download_sample_keycloak_themes_1 = require("../download-sample-keycloak-themes");
var downloadAndUnzip_1 = require("../tools/downloadAndUnzip");
var child_process = __importStar(require("child_process"));
var ftlValuesGlobalName_1 = require("./ftlValuesGlobalName");
function generateKeycloakThemeResources(params) {
    var themeName = params.themeName, reactAppBuildDirPath = params.reactAppBuildDirPath, keycloakThemeBuildingDirPath = params.keycloakThemeBuildingDirPath;
    var themeDirPath = path_1.join(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme", themeName, "login");
    var allCssGlobalsToDefine = {};
    transformCodebase_1.transformCodebase({
        "destDirPath": path_1.join(themeDirPath, "resources", "build"),
        "srcDirPath": reactAppBuildDirPath,
        "transformSourceCode": function (_a) {
            var filePath = _a.filePath, sourceCode = _a.sourceCode;
            if (/\.css?$/i.test(filePath)) {
                var _b = replaceImportFromStatic_1.replaceImportFromStaticInCssCode({ "cssCode": sourceCode.toString("utf8") }), cssGlobalsToDefine = _b.cssGlobalsToDefine, fixedCssCode = _b.fixedCssCode;
                allCssGlobalsToDefine = __assign(__assign({}, allCssGlobalsToDefine), cssGlobalsToDefine);
                return { "modifiedSourceCode": Buffer.from(fixedCssCode, "utf8") };
            }
            if (/\.js?$/i.test(filePath)) {
                var fixedJsCode = replaceImportFromStatic_1.replaceImportFromStaticInJsCode({
                    "jsCode": sourceCode.toString("utf8"),
                    ftlValuesGlobalName: ftlValuesGlobalName_1.ftlValuesGlobalName
                }).fixedJsCode;
                return { "modifiedSourceCode": Buffer.from(fixedJsCode, "utf8") };
            }
            return { "modifiedSourceCode": sourceCode };
        }
    });
    var generateFtlFilesCode = generateFtl_1.generateFtlFilesCodeFactory({
        "cssGlobalsToDefine": allCssGlobalsToDefine,
        ftlValuesGlobalName: ftlValuesGlobalName_1.ftlValuesGlobalName,
        "indexHtmlCode": fs.readFileSync(path_1.join(reactAppBuildDirPath, "index.html")).toString("utf8")
    }).generateFtlFilesCode;
    ["login.ftl", "register.ftl"].forEach(function (pageBasename) {
        var ftlCode = generateFtlFilesCode({ pageBasename: pageBasename }).ftlCode;
        fs.writeFileSync(path_1.join(themeDirPath, pageBasename), Buffer.from(ftlCode, "utf8"));
    });
    {
        var tmpDirPath = path_1.join(themeDirPath, "..", "tmp_xxKdLpdIdLd");
        downloadAndUnzip_1.downloadAndUnzip({
            "url": download_sample_keycloak_themes_1.keycloakBuiltinThemesAndThirdPartyExamplesThemsUrl,
            "destDirPath": tmpDirPath
        });
        transformCodebase_1.transformCodebase({
            "srcDirPath": path_1.join(tmpDirPath, "keycloak", "common"),
            "destDirPath": path_1.join(tmpDirPath, "..", "common")
        });
        transformCodebase_1.transformCodebase({
            "srcDirPath": path_1.join(tmpDirPath, "keycloak", "login", "resources"),
            "destDirPath": path_1.join(themeDirPath, "resources")
        });
        child_process.execSync("rm -r " + tmpDirPath);
    }
    fs.writeFileSync(path_1.join(themeDirPath, "theme.properties"), Buffer.from([
        "[import=common/" + themeName,
        "locales=ca,cs,de,en,es,fr,it,ja,lt,nl,no,pl,pt-BR,ru,sk,sv,tr,zh-CN"
    ].join("\n"), "utf8"));
}
exports.generateKeycloakThemeResources = generateKeycloakThemeResources;
//# sourceMappingURL=generateKeycloakThemeResources.js.map