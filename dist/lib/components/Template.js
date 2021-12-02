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
exports.Template = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var useKcMessage_1 = require("../i18n/useKcMessage");
var useKcLanguageTag_1 = require("../i18n/useKcLanguageTag");
var assert_1 = require("../tools/assert");
var KcLanguageTag_1 = require("../i18n/KcLanguageTag");
var KcLanguageTag_2 = require("../i18n/KcLanguageTag");
var useCallbackFactory_1 = require("powerhooks/useCallbackFactory");
var headInsert_1 = require("../tools/headInsert");
var path_1 = require("path");
var useConstCallback_1 = require("powerhooks/useConstCallback");
var tss_react_1 = require("tss-react");
exports.Template = (0, react_1.memo)(function (props) {
    var _a = props.displayInfo, displayInfo = _a === void 0 ? false : _a, _b = props.displayMessage, displayMessage = _b === void 0 ? true : _b, _c = props.displayRequiredFields, displayRequiredFields = _c === void 0 ? false : _c, _d = props.displayWide, displayWide = _d === void 0 ? false : _d, _e = props.showAnotherWayIfPresent, showAnotherWayIfPresent = _e === void 0 ? true : _e, headerNode = props.headerNode, _f = props.showUsernameNode, showUsernameNode = _f === void 0 ? null : _f, formNode = props.formNode, _g = props.infoNode, infoNode = _g === void 0 ? null : _g, kcContext = props.kcContext, doFetchDefaultThemeResources = props.doFetchDefaultThemeResources;
    var cx = (0, tss_react_1.useCssAndCx)().cx;
    (0, react_1.useEffect)(function () {
        console.log("Rendering this page with react using keycloakify");
    }, []);
    var msg = (0, useKcMessage_1.useKcMessage)().msg;
    var _h = (0, useKcLanguageTag_1.useKcLanguageTag)(), kcLanguageTag = _h.kcLanguageTag, setKcLanguageTag = _h.setKcLanguageTag;
    var onChangeLanguageClickFactory = (0, useCallbackFactory_1.useCallbackFactory)(function (_a) {
        var _b = __read(_a, 1), languageTag = _b[0];
        return setKcLanguageTag(languageTag);
    });
    var onTryAnotherWayClick = (0, useConstCallback_1.useConstCallback)(function () { return (document.forms["kc-select-try-another-way-form"].submit(), false); });
    var realm = kcContext.realm, locale = kcContext.locale, auth = kcContext.auth, url = kcContext.url, message = kcContext.message, isAppInitiatedAction = kcContext.isAppInitiatedAction;
    (0, react_1.useEffect)(function () {
        if (!realm.internationalizationEnabled) {
            return;
        }
        (0, assert_1.assert)(locale !== undefined);
        if (kcLanguageTag === (0, KcLanguageTag_1.getBestMatchAmongKcLanguageTag)(locale.current)) {
            return;
        }
        window.location.href = locale.supported.find(function (_a) {
            var languageTag = _a.languageTag;
            return languageTag === kcLanguageTag;
        }).url;
    }, [kcLanguageTag]);
    var _j = __read((0, react_1.useReducer)(function () { return true; }, false), 2), isExtraCssLoaded = _j[0], setExtraCssLoaded = _j[1];
    (0, react_1.useEffect)(function () {
        if (!doFetchDefaultThemeResources) {
            setExtraCssLoaded();
            return;
        }
        var isUnmounted = false;
        var cleanups = [];
        var toArr = function (x) { return (typeof x === "string" ? x.split(" ") : x !== null && x !== void 0 ? x : []); };
        Promise.all(__spreadArray(__spreadArray([], __read(toArr(props.stylesCommon).map(function (relativePath) { return (0, path_1.join)(url.resourcesCommonPath, relativePath); })), false), __read(toArr(props.styles).map(function (relativePath) { return (0, path_1.join)(url.resourcesPath, relativePath); })), false).reverse()
            .map(function (href) {
            return (0, headInsert_1.headInsert)({
                "type": "css",
                href: href,
                "position": "prepend",
            });
        })).then(function () {
            if (isUnmounted) {
                return;
            }
            setExtraCssLoaded();
        });
        toArr(props.scripts).forEach(function (relativePath) {
            return (0, headInsert_1.headInsert)({
                "type": "javascript",
                "src": (0, path_1.join)(url.resourcesPath, relativePath),
            });
        });
        if (props.kcHtmlClass !== undefined) {
            var htmlClassList_1 = document.getElementsByTagName("html")[0].classList;
            var tokens_1 = cx(props.kcHtmlClass).split(" ");
            htmlClassList_1.add.apply(htmlClassList_1, __spreadArray([], __read(tokens_1), false));
            cleanups.push(function () { return htmlClassList_1.remove.apply(htmlClassList_1, __spreadArray([], __read(tokens_1), false)); });
        }
        return function () {
            isUnmounted = true;
            cleanups.forEach(function (f) { return f(); });
        };
    }, [props.kcHtmlClass]);
    if (!isExtraCssLoaded) {
        return null;
    }
    return ((0, jsx_runtime_1.jsxs)("div", __assign({ className: cx(props.kcLoginClass) }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ id: "kc-header", className: cx(props.kcHeaderClass) }, { children: (0, jsx_runtime_1.jsx)("div", __assign({ id: "kc-header-wrapper", className: cx(props.kcHeaderWrapperClass) }, { children: msg("loginTitleHtml", realm.displayNameHtml) }), void 0) }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ className: cx(props.kcFormCardClass, displayWide && props.kcFormCardAccountClass) }, { children: [(0, jsx_runtime_1.jsxs)("header", __assign({ className: cx(props.kcFormHeaderClass) }, { children: [realm.internationalizationEnabled && ((0, assert_1.assert)(locale !== undefined), true) && locale.supported.length > 1 && ((0, jsx_runtime_1.jsx)("div", __assign({ id: "kc-locale" }, { children: (0, jsx_runtime_1.jsx)("div", __assign({ id: "kc-locale-wrapper", className: cx(props.kcLocaleWrapperClass) }, { children: (0, jsx_runtime_1.jsxs)("div", __assign({ className: "kc-dropdown", id: "kc-locale-dropdown" }, { children: [(0, jsx_runtime_1.jsx)("a", __assign({ href: "#", id: "kc-current-locale-link" }, { children: (0, KcLanguageTag_2.getKcLanguageTagLabel)(kcLanguageTag) }), void 0), (0, jsx_runtime_1.jsx)("ul", { children: locale.supported.map(function (_a) {
                                                    var languageTag = _a.languageTag;
                                                    return ((0, jsx_runtime_1.jsx)("li", __assign({ className: "kc-dropdown-item" }, { children: (0, jsx_runtime_1.jsx)("a", __assign({ href: "#", onClick: onChangeLanguageClickFactory(languageTag) }, { children: (0, KcLanguageTag_2.getKcLanguageTagLabel)(languageTag) }), void 0) }), languageTag));
                                                }) }, void 0)] }), void 0) }), void 0) }), void 0)), !(auth !== undefined && auth.showUsername && !auth.showResetCredentials) ? (displayRequiredFields ? ((0, jsx_runtime_1.jsxs)("div", __assign({ className: cx(props.kcContentWrapperClass) }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcLabelWrapperClass, "subtitle") }, { children: (0, jsx_runtime_1.jsxs)("span", __assign({ className: "subtitle" }, { children: [(0, jsx_runtime_1.jsx)("span", __assign({ className: "required" }, { children: "*" }), void 0), msg("requiredFields")] }), void 0) }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ className: "col-md-10" }, { children: (0, jsx_runtime_1.jsx)("h1", __assign({ id: "kc-page-title" }, { children: headerNode }), void 0) }), void 0)] }), void 0)) : ((0, jsx_runtime_1.jsx)("h1", __assign({ id: "kc-page-title" }, { children: headerNode }), void 0))) : displayRequiredFields ? ((0, jsx_runtime_1.jsxs)("div", __assign({ className: cx(props.kcContentWrapperClass) }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcLabelWrapperClass, "subtitle") }, { children: (0, jsx_runtime_1.jsxs)("span", __assign({ className: "subtitle" }, { children: [(0, jsx_runtime_1.jsx)("span", __assign({ className: "required" }, { children: "*" }), void 0), " ", msg("requiredFields")] }), void 0) }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ className: "col-md-10" }, { children: [showUsernameNode, (0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcFormGroupClass) }, { children: (0, jsx_runtime_1.jsxs)("div", __assign({ id: "kc-username" }, { children: [(0, jsx_runtime_1.jsx)("label", __assign({ id: "kc-attempted-username" }, { children: auth === null || auth === void 0 ? void 0 : auth.attemptedUsername }), void 0), (0, jsx_runtime_1.jsx)("a", __assign({ id: "reset-login", href: url.loginRestartFlowUrl }, { children: (0, jsx_runtime_1.jsxs)("div", __assign({ className: "kc-login-tooltip" }, { children: [(0, jsx_runtime_1.jsx)("i", { className: cx(props.kcResetFlowIcon) }, void 0), (0, jsx_runtime_1.jsx)("span", __assign({ className: "kc-tooltip-text" }, { children: msg("restartLoginTooltip") }), void 0)] }), void 0) }), void 0)] }), void 0) }), void 0)] }), void 0)] }), void 0)) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [showUsernameNode, (0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcFormGroupClass) }, { children: (0, jsx_runtime_1.jsxs)("div", __assign({ id: "kc-username" }, { children: [(0, jsx_runtime_1.jsx)("label", __assign({ id: "kc-attempted-username" }, { children: auth === null || auth === void 0 ? void 0 : auth.attemptedUsername }), void 0), (0, jsx_runtime_1.jsx)("a", __assign({ id: "reset-login", href: url.loginRestartFlowUrl }, { children: (0, jsx_runtime_1.jsxs)("div", __assign({ className: "kc-login-tooltip" }, { children: [(0, jsx_runtime_1.jsx)("i", { className: cx(props.kcResetFlowIcon) }, void 0), (0, jsx_runtime_1.jsx)("span", __assign({ className: "kc-tooltip-text" }, { children: msg("restartLoginTooltip") }), void 0)] }), void 0) }), void 0)] }), void 0) }), void 0)] }, void 0))] }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ id: "kc-content" }, { children: (0, jsx_runtime_1.jsxs)("div", __assign({ id: "kc-content-wrapper" }, { children: [displayMessage && message !== undefined && (message.type !== "warning" || !isAppInitiatedAction) && ((0, jsx_runtime_1.jsxs)("div", __assign({ className: cx("alert", "alert-" + message.type) }, { children: [message.type === "success" && (0, jsx_runtime_1.jsx)("span", { className: cx(props.kcFeedbackSuccessIcon) }, void 0), message.type === "warning" && (0, jsx_runtime_1.jsx)("span", { className: cx(props.kcFeedbackWarningIcon) }, void 0), message.type === "error" && (0, jsx_runtime_1.jsx)("span", { className: cx(props.kcFeedbackErrorIcon) }, void 0), message.type === "info" && (0, jsx_runtime_1.jsx)("span", { className: cx(props.kcFeedbackInfoIcon) }, void 0), (0, jsx_runtime_1.jsx)("span", { className: "kc-feedback-text", dangerouslySetInnerHTML: {
                                                "__html": message.summary,
                                            } }, void 0)] }), void 0)), formNode, auth !== undefined && auth.showTryAnotherWayLink && showAnotherWayIfPresent && ((0, jsx_runtime_1.jsx)("form", __assign({ id: "kc-select-try-another-way-form", action: url.loginAction, method: "post", className: cx(displayWide && props.kcContentWrapperClass) }, { children: (0, jsx_runtime_1.jsx)("div", __assign({ className: cx(displayWide && [props.kcFormSocialAccountContentClass, props.kcFormSocialAccountClass]) }, { children: (0, jsx_runtime_1.jsxs)("div", __assign({ className: cx(props.kcFormGroupClass) }, { children: [(0, jsx_runtime_1.jsx)("input", { type: "hidden", name: "tryAnotherWay", value: "on" }, void 0), (0, jsx_runtime_1.jsx)("a", __assign({ href: "#", id: "try-another-way", onClick: onTryAnotherWayClick }, { children: msg("doTryAnotherWay") }), void 0)] }), void 0) }), void 0) }), void 0)), displayInfo && ((0, jsx_runtime_1.jsx)("div", __assign({ id: "kc-info", className: cx(props.kcSignUpClass) }, { children: (0, jsx_runtime_1.jsx)("div", __assign({ id: "kc-info-wrapper", className: cx(props.kcInfoAreaWrapperClass) }, { children: infoNode }), void 0) }), void 0))] }), void 0) }), void 0)] }), void 0)] }), void 0));
});
//# sourceMappingURL=Template.js.map