"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFtlFilesCodeFactory = void 0;
var cheerio_1 = __importDefault(require("cheerio"));
var replaceImportFromStatic_1 = require("../replaceImportFromStatic");
var fs_1 = __importDefault(require("fs"));
var path_1 = require("path");
var objectKeys_1 = require("evt/tools/typeSafety/objectKeys");
function generateFtlFilesCodeFactory(params) {
    var ftlValuesGlobalName = params.ftlValuesGlobalName, cssGlobalsToDefine = params.cssGlobalsToDefine, indexHtmlCode = params.indexHtmlCode;
    var $ = cheerio_1.default.load(indexHtmlCode);
    $("script:not([src])").each(function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var _b = __read(_a, 2), element = _b[1];
        var fixedJsCode = replaceImportFromStatic_1.replaceImportFromStaticInJsCode({
            ftlValuesGlobalName: ftlValuesGlobalName,
            "jsCode": $(element).html()
        }).fixedJsCode;
        $(element).text(fixedJsCode);
    });
    [
        ["link", "href"],
        ["script", "src"],
    ].forEach(function (_a) {
        var _b = __read(_a, 2), selector = _b[0], attrName = _b[1];
        return $(selector).each(function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var _b = __read(_a, 2), element = _b[1];
            var href = $(element).attr(attrName);
            if (!(href === null || href === void 0 ? void 0 : href.startsWith("/"))) {
                return;
            }
            $(element).attr(attrName, "${url.resourcesPath}/build" + href);
        });
    });
    //FTL is no valid html, we can't insert with cheerio, we put placeholder for injecting later.
    var ftlPlaceholders = {
        '{ "x": "xIdLqMeOed9sdLdIdOxdK0d" }': fs_1.default.readFileSync(path_1.join(__dirname, "ftl2js.ftl"))
            .toString("utf8")
            .match(/^<script>const _=((?:.|\n)+)<\/script>[\n]?$/)[1],
        '<!-- xIdLqMeOedErIdLsPdNdI9dSlxI -->': [
            '<#if scripts??>',
            '    <#list scripts as script>',
            '        <script src="${script}" type="text/javascript"></script>',
            '    </#list>',
            '</#if>',
        ].join("\n")
    };
    $("head").prepend(__spreadArray(__spreadArray([], __read((Object.keys(cssGlobalsToDefine).length === 0 ? [] : [
        '',
        '<style>',
        replaceImportFromStatic_1.generateCssCodeToDefineGlobals({ cssGlobalsToDefine: cssGlobalsToDefine }).cssCodeToPrependInHead,
        '</style>',
        ''
    ]))), [
        '<script>',
        '    Object.assign(',
        "        window." + ftlValuesGlobalName + ",",
        "        " + objectKeys_1.objectKeys(ftlPlaceholders)[0],
        '    );',
        '</script>',
        '',
        objectKeys_1.objectKeys(ftlPlaceholders)[1],
        ''
    ]).join("\n"));
    var partiallyFixedIndexHtmlCode = $.html();
    function generateFtlFilesCode(params) {
        var pageBasename = params.pageBasename;
        var $ = cheerio_1.default.load(partiallyFixedIndexHtmlCode);
        $("head").prepend([
            '',
            '<script>',
            "   window." + ftlValuesGlobalName + " = { \"pageBasename\": \"" + pageBasename + "\" };",
            '</script>',
            ''
        ].join("\n"));
        var ftlCode = $.html();
        objectKeys_1.objectKeys(ftlPlaceholders)
            .forEach(function (id) { return ftlCode = ftlCode.replace(id, ftlPlaceholders[id]); });
        return { ftlCode: ftlCode };
    }
    return { generateFtlFilesCode: generateFtlFilesCode };
}
exports.generateFtlFilesCodeFactory = generateFtlFilesCodeFactory;
//# sourceMappingURL=index.js.map