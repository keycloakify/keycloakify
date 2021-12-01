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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKeycloakThemeResources = void 0;
var transformCodebase_1 = require("../tools/transformCodebase");
var fs = __importStar(require("fs"));
var path_1 = require("path");
var replaceImportFromStatic_1 = require("./replaceImportFromStatic");
var generateFtl_1 = require("./generateFtl");
var download_builtin_keycloak_theme_1 = require("../download-builtin-keycloak-theme");
var child_process = __importStar(require("child_process"));
var urlResourcesPath_1 = require("../../lib/getKcContext/kcContextMocks/urlResourcesPath");
var isInside_1 = require("../tools/isInside");
function generateKeycloakThemeResources(params) {
    var themeName = params.themeName, reactAppBuildDirPath = params.reactAppBuildDirPath, keycloakThemeBuildingDirPath = params.keycloakThemeBuildingDirPath, urlPathname = params.urlPathname, urlOrigin = params.urlOrigin, extraPagesId = params.extraPagesId, extraThemeProperties = params.extraThemeProperties, keycloakVersion = params.keycloakVersion;
    var themeDirPath = (0, path_1.join)(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme", themeName, "login");
    var allCssGlobalsToDefine = {};
    (0, transformCodebase_1.transformCodebase)({
        "destDirPath": urlOrigin === undefined ? (0, path_1.join)(themeDirPath, "resources", "build") : reactAppBuildDirPath,
        "srcDirPath": reactAppBuildDirPath,
        "transformSourceCode": function (_a) {
            var filePath = _a.filePath, sourceCode = _a.sourceCode;
            //NOTE: Prevent cycles, excludes the folder we generated for debug in public/
            if (urlOrigin === undefined &&
                (0, isInside_1.isInside)({
                    "dirPath": (0, path_1.join)(reactAppBuildDirPath, urlResourcesPath_1.subDirOfPublicDirBasename),
                    filePath: filePath,
                })) {
                return undefined;
            }
            if (urlOrigin === undefined && /\.css?$/i.test(filePath)) {
                var _b = (0, replaceImportFromStatic_1.replaceImportsInCssCode)({
                    "cssCode": sourceCode.toString("utf8"),
                }), cssGlobalsToDefine = _b.cssGlobalsToDefine, fixedCssCode = _b.fixedCssCode;
                allCssGlobalsToDefine = __assign(__assign({}, allCssGlobalsToDefine), cssGlobalsToDefine);
                return {
                    "modifiedSourceCode": Buffer.from(fixedCssCode, "utf8"),
                };
            }
            if (/\.js?$/i.test(filePath)) {
                var fixedJsCode = (0, replaceImportFromStatic_1.replaceImportsFromStaticInJsCode)({
                    "jsCode": sourceCode.toString("utf8"),
                    urlOrigin: urlOrigin,
                }).fixedJsCode;
                return {
                    "modifiedSourceCode": Buffer.from(fixedJsCode, "utf8"),
                };
            }
            return urlOrigin === undefined ? { "modifiedSourceCode": sourceCode } : undefined;
        },
    });
    var generateFtlFilesCode = (0, generateFtl_1.generateFtlFilesCodeFactory)({
        "cssGlobalsToDefine": allCssGlobalsToDefine,
        "indexHtmlCode": fs.readFileSync((0, path_1.join)(reactAppBuildDirPath, "index.html")).toString("utf8"),
        urlPathname: urlPathname,
        urlOrigin: urlOrigin,
    }).generateFtlFilesCode;
    __spreadArray(__spreadArray([], __read(generateFtl_1.pageIds), false), __read(extraPagesId), false).forEach(function (pageId) {
        var ftlCode = generateFtlFilesCode({ pageId: pageId }).ftlCode;
        fs.mkdirSync(themeDirPath, { "recursive": true });
        fs.writeFileSync((0, path_1.join)(themeDirPath, pageId), Buffer.from(ftlCode, "utf8"));
    });
    {
        var tmpDirPath = (0, path_1.join)(themeDirPath, "..", "tmp_xxKdLpdIdLd");
        (0, download_builtin_keycloak_theme_1.downloadBuiltinKeycloakTheme)({
            keycloakVersion: keycloakVersion,
            "destDirPath": tmpDirPath,
        });
        var themeResourcesDirPath = (0, path_1.join)(themeDirPath, "resources");
        (0, transformCodebase_1.transformCodebase)({
            "srcDirPath": (0, path_1.join)(tmpDirPath, "keycloak", "login", "resources"),
            "destDirPath": themeResourcesDirPath,
        });
        var reactAppPublicDirPath = (0, path_1.join)(reactAppBuildDirPath, "..", "public");
        (0, transformCodebase_1.transformCodebase)({
            "srcDirPath": themeResourcesDirPath,
            "destDirPath": (0, path_1.join)(reactAppPublicDirPath, urlResourcesPath_1.resourcesPath),
        });
        (0, transformCodebase_1.transformCodebase)({
            "srcDirPath": (0, path_1.join)(tmpDirPath, "keycloak", "common", "resources"),
            "destDirPath": (0, path_1.join)(reactAppPublicDirPath, urlResourcesPath_1.resourcesCommonPath),
        });
        var keycloakResourcesWithinPublicDirPath = (0, path_1.join)(reactAppPublicDirPath, urlResourcesPath_1.subDirOfPublicDirBasename);
        fs.writeFileSync((0, path_1.join)(keycloakResourcesWithinPublicDirPath, "README.txt"), Buffer.from(["This is just a test folder that helps develop", "the login and register page without having to yarn build"].join(" ")));
        fs.writeFileSync((0, path_1.join)(keycloakResourcesWithinPublicDirPath, ".gitignore"), Buffer.from("*", "utf8"));
        child_process.execSync("rm -r " + tmpDirPath);
    }
    fs.writeFileSync((0, path_1.join)(themeDirPath, "theme.properties"), Buffer.from("parent=keycloak".concat("\n\n", extraThemeProperties.join("\n\n")), "utf8"));
}
exports.generateKeycloakThemeResources = generateKeycloakThemeResources;
//# sourceMappingURL=generateKeycloakThemeResources.js.map