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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFtlFilesCodeFactory = exports.pageIds = void 0;
var cheerio_1 = __importDefault(require("cheerio"));
var replaceImportFromStatic_1 = require("../replaceImportFromStatic");
var fs_1 = __importDefault(require("fs"));
var path_1 = require("path");
var objectKeys_1 = require("tsafe/objectKeys");
var ftlValuesGlobalName_1 = require("../ftlValuesGlobalName");
exports.pageIds = [
    "login.ftl",
    "register.ftl",
    "register-user-profile.ftl",
    "info.ftl",
    "error.ftl",
    "login-reset-password.ftl",
    "login-verify-email.ftl",
    "terms.ftl",
    "login-otp.ftl",
    "login-update-profile.ftl",
    "login-idp-link-confirm.ftl",
    "login-config-totp.ftl",
    "saml-post-form.ftl",
    // "code.ftl",
    // "delete-account-confirm.ftl",
    // "idp-review-user-profile.ftl",
    // "login-config-totp-text.ftl",
    // "login-idp-link-email.ftl",
    // "login-oauth2-device-verify-user-code.ftl",
    // "login-oauth-grant.ftl",
    // "login-page-expired.ftl",
    // "login-password.ftl",
    // "login-update-password.ftl",
    // "login-username.ftl",
    // "login-verify-email-code-text.ftl",
    // "login-x509-info.ftl",
    // "select-authenticator.ftl",
    // "update-user-profile.ftl",
    // "webauthn-authenticate.ftl",
    // "webauthn-error.ftl",
    // "webauthn-register.ftl",
];
function loadAdjacentFile(fileBasename) {
    return fs_1.default.readFileSync((0, path_1.join)(__dirname, fileBasename)).toString("utf8");
}
function generateFtlFilesCodeFactory(params) {
    var cssGlobalsToDefine = params.cssGlobalsToDefine, indexHtmlCode = params.indexHtmlCode, urlPathname = params.urlPathname, urlOrigin = params.urlOrigin;
    var $ = cheerio_1.default.load(indexHtmlCode);
    $("script:not([src])").each(function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var _b = __read(_a, 2), element = _b[1];
        var fixedJsCode = (0, replaceImportFromStatic_1.replaceImportsFromStaticInJsCode)({
            "jsCode": $(element).html(),
            urlOrigin: urlOrigin,
        }).fixedJsCode;
        $(element).text(fixedJsCode);
    });
    $("style").each(function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var _b = __read(_a, 2), element = _b[1];
        var fixedCssCode = (0, replaceImportFromStatic_1.replaceImportsInInlineCssCode)({
            "cssCode": $(element).html(),
            "urlPathname": params.urlPathname,
            urlOrigin: urlOrigin,
        }).fixedCssCode;
        $(element).text(fixedCssCode);
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
            if (href === undefined) {
                return;
            }
            $(element).attr(attrName, urlOrigin !== undefined
                ? href.replace(/^\//, urlOrigin + "/")
                : href.replace(new RegExp("^" + urlPathname.replace(/\//g, "\\/")), "${url.resourcesPath}/build/"));
        });
    });
    //FTL is no valid html, we can't insert with cheerio, we put placeholder for injecting later.
    var ftlPlaceholders = {
        '{ "x": "vIdLqMeOed9sdLdIdOxdK0d" }': loadAdjacentFile("common.ftl").match(/^<script>const _=((?:.|\n)+)<\/script>[\n]?$/)[1],
        "<!-- xIdLqMeOedErIdLsPdNdI9dSlxI -->": [
            "<#if scripts??>",
            "    <#list scripts as script>",
            '        <script src="${script}" type="text/javascript"></script>',
            "    </#list>",
            "</#if>",
        ].join("\n"),
    };
    var pageSpecificCodePlaceholder = "<!-- dIddLqMeOedErIdLsPdNdI9dSl42sw -->";
    $("head").prepend(__spreadArray(__spreadArray([], __read((Object.keys(cssGlobalsToDefine).length === 0
        ? []
        : [
            "",
            "<style>",
            (0, replaceImportFromStatic_1.generateCssCodeToDefineGlobals)({
                cssGlobalsToDefine: cssGlobalsToDefine,
                urlPathname: urlPathname,
            }).cssCodeToPrependInHead,
            "</style>",
            "",
        ])), false), [
        "<script>",
        loadAdjacentFile("Object.deepAssign.js"),
        "</script>",
        "<script>",
        "    window." + ftlValuesGlobalName_1.ftlValuesGlobalName + "= Object.assign(",
        "        {},",
        "        " + (0, objectKeys_1.objectKeys)(ftlPlaceholders)[0],
        "    );",
        "</script>",
        "",
        pageSpecificCodePlaceholder,
        "",
        (0, objectKeys_1.objectKeys)(ftlPlaceholders)[1],
    ], false).join("\n"));
    var partiallyFixedIndexHtmlCode = $.html();
    function generateFtlFilesCode(params) {
        var pageId = params.pageId;
        var $ = cheerio_1.default.load(partiallyFixedIndexHtmlCode);
        var ftlCode = $.html().replace(pageSpecificCodePlaceholder, [
            "<script>",
            "    Object.deepAssign(",
            "        window." + ftlValuesGlobalName_1.ftlValuesGlobalName + ",",
            "        { \"pageId\": \"" + pageId + "\" }",
            "    );",
            "</script>",
        ].join("\n"));
        (0, objectKeys_1.objectKeys)(ftlPlaceholders).forEach(function (id) { return (ftlCode = ftlCode.replace(id, ftlPlaceholders[id]).replace('ftl_template_for_replacement', pageId)); });
        return { ftlCode: ftlCode };
    }
    return { generateFtlFilesCode: generateFtlFilesCode };
}
exports.generateFtlFilesCodeFactory = generateFtlFilesCodeFactory;
//# sourceMappingURL=generateFtl.js.map