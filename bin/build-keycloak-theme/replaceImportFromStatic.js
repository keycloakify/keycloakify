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
exports.generateCssCodeToDefineGlobals = exports.replaceImportsInCssCode = exports.replaceImportsInInlineCssCode = exports.replaceImportsFromStaticInJsCode = void 0;
var crypto = __importStar(require("crypto"));
var ftlValuesGlobalName_1 = require("./ftlValuesGlobalName");
function replaceImportsFromStaticInJsCode(params) {
    /*
    NOTE:

    When we have urlOrigin defined it means that
    we are building with --external-assets
    so we have to make sur that the fixed js code will run
    inside and outside keycloak.

    When urlOrigin isn't defined we can assume the fixedJsCode
    will always run in keycloak context.
    */
    var jsCode = params.jsCode, urlOrigin = params.urlOrigin;
    var fixedJsCode = jsCode
        .replace(/([a-z]+\.[a-z]+)\+"static\//g, function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var _b = __read(_a, 2), group = _b[1];
        return urlOrigin === undefined
            ? "window." + ftlValuesGlobalName_1.ftlValuesGlobalName + ".url.resourcesPath + \"/build/static/"
            : "(\"" + ftlValuesGlobalName_1.ftlValuesGlobalName + "\" in window ? \"" + urlOrigin + "\" : \"\") + " + group + " + \"static/";
    })
        .replace(/".chunk.css",([a-z])+=([a-z]+\.[a-z]+)\+([a-z]+),/, function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var _b = __read(_a, 4), group1 = _b[1], group2 = _b[2], group3 = _b[3];
        return urlOrigin === undefined
            ? "\".chunk.css\"," + group1 + " = window." + ftlValuesGlobalName_1.ftlValuesGlobalName + ".url.resourcesPath + \"/build/\" + " + group3 + ","
            : "\".chunk.css\"," + group1 + " = (\"" + ftlValuesGlobalName_1.ftlValuesGlobalName + "\" in window ? \"" + urlOrigin + "\" : \"\") + " + group2 + " + " + group3 + ",";
    });
    return { fixedJsCode: fixedJsCode };
}
exports.replaceImportsFromStaticInJsCode = replaceImportsFromStaticInJsCode;
function replaceImportsInInlineCssCode(params) {
    var cssCode = params.cssCode, urlPathname = params.urlPathname, urlOrigin = params.urlOrigin;
    var fixedCssCode = cssCode.replace(urlPathname === "/" ? /url\(\/([^/][^)]+)\)/g : new RegExp("url\\(" + urlPathname + "([^)]+)\\)", "g"), function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var _b = __read(_a, 2), group = _b[1];
        return "url(" + (urlOrigin === undefined ? "${url.resourcesPath}/build/" + group : params.urlOrigin + urlPathname + group) + ")";
    });
    return { fixedCssCode: fixedCssCode };
}
exports.replaceImportsInInlineCssCode = replaceImportsInInlineCssCode;
function replaceImportsInCssCode(params) {
    var _a;
    var cssCode = params.cssCode;
    var cssGlobalsToDefine = {};
    new Set((_a = cssCode.match(/url\(\/[^/][^)]+\)[^;}]*/g)) !== null && _a !== void 0 ? _a : []).forEach(function (match) { return (cssGlobalsToDefine["url" + crypto.createHash("sha256").update(match).digest("hex").substring(0, 15)] = match); });
    var fixedCssCode = cssCode;
    Object.keys(cssGlobalsToDefine).forEach(function (cssVariableName) {
        //NOTE: split/join pattern ~ replace all
        return (fixedCssCode = fixedCssCode.split(cssGlobalsToDefine[cssVariableName]).join("var(--" + cssVariableName + ")"));
    });
    return { fixedCssCode: fixedCssCode, cssGlobalsToDefine: cssGlobalsToDefine };
}
exports.replaceImportsInCssCode = replaceImportsInCssCode;
function generateCssCodeToDefineGlobals(params) {
    var cssGlobalsToDefine = params.cssGlobalsToDefine, urlPathname = params.urlPathname;
    return {
        "cssCodeToPrependInHead": __spreadArray(__spreadArray([
            ":root {"
        ], __read(Object.keys(cssGlobalsToDefine)
            .map(function (cssVariableName) {
            return [
                "--" + cssVariableName + ":",
                cssGlobalsToDefine[cssVariableName].replace(new RegExp("url\\(" + urlPathname.replace(/\//g, "\\/"), "g"), "url(${url.resourcesPath}/build/"),
            ].join(" ");
        })
            .map(function (line) { return "    " + line + ";"; })), false), [
            "}",
        ], false).join("\n"),
    };
}
exports.generateCssCodeToDefineGlobals = generateCssCodeToDefineGlobals;
//# sourceMappingURL=replaceImportFromStatic.js.map