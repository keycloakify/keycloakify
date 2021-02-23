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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCssCodeToDefineGlobals = exports.replaceImportFromStaticInCssCode = exports.replaceImportFromStaticInJsCode = void 0;
var crypto = __importStar(require("crypto"));
function replaceImportFromStaticInJsCode(params) {
    var jsCode = params.jsCode, ftlValuesGlobalName = params.ftlValuesGlobalName;
    var fixedJsCode = jsCode.replace(/"static\//g, "window." + ftlValuesGlobalName + ".url.resourcesPath.replace(/^\\//,\"\") + \"/\" + \"static/");
    return { fixedJsCode: fixedJsCode };
}
exports.replaceImportFromStaticInJsCode = replaceImportFromStaticInJsCode;
function replaceImportFromStaticInCssCode(params) {
    var _a;
    var cssCode = params.cssCode;
    var cssGlobalsToDefine = {};
    new Set((_a = cssCode.match(/(url\(\/[^)]+\))/g)) !== null && _a !== void 0 ? _a : [])
        .forEach(function (match) {
        return cssGlobalsToDefine["url" + crypto
            .createHash("sha256")
            .update(match)
            .digest("hex")
            .substring(0, 15)] = match;
    });
    var fixedCssCode = cssCode;
    Object.keys(cssGlobalsToDefine).forEach(function (cssVariableName) {
        //NOTE: split/join pattern ~ replace all
        return fixedCssCode =
            fixedCssCode.split(cssGlobalsToDefine[cssVariableName])
                .join("var(--" + cssVariableName + ")");
    });
    return { fixedCssCode: fixedCssCode, cssGlobalsToDefine: cssGlobalsToDefine };
}
exports.replaceImportFromStaticInCssCode = replaceImportFromStaticInCssCode;
function generateCssCodeToDefineGlobals(params) {
    var cssGlobalsToDefine = params.cssGlobalsToDefine;
    return {
        "cssCodeToPrependInHead": __spread([
            ":root {"
        ], Object.keys(cssGlobalsToDefine)
            .map(function (cssVariableName) { return [
            "--" + cssVariableName + ":",
            [
                "url(",
                "${url.resourcesPath}" +
                    cssGlobalsToDefine[cssVariableName].match(/^url\(([^)]+)\)$/)[1],
                ")"
            ].join("")
        ].join(" "); })
            .map(function (line) { return "    " + line + ";"; }), [
            "}"
        ]).join("\n")
    };
}
exports.generateCssCodeToDefineGlobals = generateCssCodeToDefineGlobals;
//# sourceMappingURL=replaceImportFromStatic.js.map