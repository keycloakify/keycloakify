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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Template = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var useKcMessage_1 = require("../i18n/useKcMessage");
var useKcLanguageTag_1 = require("../i18n/useKcLanguageTag");
var assert_1 = require("../tools/assert");
var tss_react_1 = require("tss-react");
var KcLanguageTag_1 = require("../i18n/KcLanguageTag");
var KcLanguageTag_2 = require("../i18n/KcLanguageTag");
var powerhooks_1 = require("powerhooks");
var appendHead_1 = require("../tools/appendHead");
var path_1 = require("path");
var powerhooks_2 = require("powerhooks");
exports.Template = react_1.memo(function (props) {
    var _a = props.displayInfo, displayInfo = _a === void 0 ? false : _a, _b = props.displayMessage, displayMessage = _b === void 0 ? true : _b, _c = props.displayRequiredFields, displayRequiredFields = _c === void 0 ? false : _c, _d = props.displayWide, displayWide = _d === void 0 ? false : _d, _e = props.showAnotherWayIfPresent, showAnotherWayIfPresent = _e === void 0 ? true : _e, headerNode = props.headerNode, _f = props.showUsernameNode, showUsernameNode = _f === void 0 ? null : _f, formNode = props.formNode, _g = props.infoNode, infoNode = _g === void 0 ? null : _g, kcContext = props.kcContext;
    react_1.useEffect(function () { console.log("Rendering this page with react using keycloakify"); }, []);
    var msg = useKcMessage_1.useKcMessage().msg;
    var _h = useKcLanguageTag_1.useKcLanguageTag(), kcLanguageTag = _h.kcLanguageTag, setKcLanguageTag = _h.setKcLanguageTag;
    var onChangeLanguageClickFactory = powerhooks_1.useCallbackFactory(function (_a) {
        var _b = __read(_a, 1), languageTag = _b[0];
        return setKcLanguageTag(languageTag);
    });
    var onTryAnotherWayClick = powerhooks_2.useConstCallback(function () {
        return (document.forms["kc-select-try-another-way-form"].submit(), false);
    });
    var realm = kcContext.realm, locale = kcContext.locale, auth = kcContext.auth, url = kcContext.url, message = kcContext.message, isAppInitiatedAction = kcContext.isAppInitiatedAction;
    react_1.useEffect(function () {
        if (!realm.internationalizationEnabled) {
            return;
        }
        assert_1.assert(locale !== undefined);
        if (kcLanguageTag === KcLanguageTag_1.getBestMatchAmongKcLanguageTag(locale.current)) {
            return;
        }
        window.location.href =
            locale.supported.find(function (_a) {
                var languageTag = _a.languageTag;
                return languageTag === kcLanguageTag;
            }).url;
    }, [kcLanguageTag]);
    var _j = __read(react_1.useReducer(function () { return true; }, false), 2), isExtraCssLoaded = _j[0], setExtraCssLoaded = _j[1];
    react_1.useEffect(function () {
        var isUnmounted = false;
        var toArr = function (x) {
            return typeof x === "string" ? x.split(" ") : x !== null && x !== void 0 ? x : [];
        };
        Promise.all(__spreadArray(__spreadArray([], __read(toArr(props.stylesCommon).map(function (relativePath) { return path_1.join(url.resourcesCommonPath, relativePath); }))), __read(toArr(props.styles).map(function (relativePath) { return path_1.join(url.resourcesPath, relativePath); }))).map(function (href) { return appendHead_1.appendHead({
            "type": "css",
            href: href
        }); })).then(function () {
            if (isUnmounted) {
                return;
            }
            setExtraCssLoaded();
        });
        toArr(props.scripts).forEach(function (relativePath) { return appendHead_1.appendHead({
            "type": "javascript",
            "src": path_1.join(url.resourcesPath, relativePath)
        }); });
        document.getElementsByTagName("html")[0]
            .classList
            .add(tss_react_1.cx(props.kcHtmlClass));
        return function () { isUnmounted = true; };
    }, []);
    if (!isExtraCssLoaded) {
        return null;
    }
    return (jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(props.kcLoginClass) }, { children: [jsx_runtime_1.jsx("div", __assign({ id: "kc-header", className: tss_react_1.cx(props.kcHeaderClass) }, { children: jsx_runtime_1.jsx("div", __assign({ id: "kc-header-wrapper", className: tss_react_1.cx(props.kcHeaderWrapperClass) }, { children: msg("loginTitleHtml", realm.displayNameHtml) }), void 0) }), void 0),
            jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(props.kcFormCardClass, displayWide && props.kcFormCardAccountClass) }, { children: [jsx_runtime_1.jsxs("header", __assign({ className: tss_react_1.cx(props.kcFormHeaderClass) }, { children: [(realm.internationalizationEnabled &&
                                (assert_1.assert(locale !== undefined), true) &&
                                locale.supported.length > 1) &&
                                jsx_runtime_1.jsx("div", __assign({ id: "kc-locale" }, { children: jsx_runtime_1.jsx("div", __assign({ id: "kc-locale-wrapper", className: tss_react_1.cx(props.kcLocaleWrapperClass) }, { children: jsx_runtime_1.jsxs("div", __assign({ className: "kc-dropdown", id: "kc-locale-dropdown" }, { children: [jsx_runtime_1.jsx("a", __assign({ href: "#", id: "kc-current-locale-link" }, { children: KcLanguageTag_2.getKcLanguageTagLabel(kcLanguageTag) }), void 0),
                                                jsx_runtime_1.jsx("ul", { children: locale.supported.map(function (_a) {
                                                        var languageTag = _a.languageTag;
                                                        return jsx_runtime_1.jsx("li", __assign({ className: "kc-dropdown-item" }, { children: jsx_runtime_1.jsx("a", __assign({ href: "#", onClick: onChangeLanguageClickFactory(languageTag) }, { children: KcLanguageTag_2.getKcLanguageTagLabel(languageTag) }), void 0) }), languageTag);
                                                    }) }, void 0)] }), void 0) }), void 0) }), void 0),
                            !(auth !== undefined &&
                                auth.showUsername &&
                                !auth.showResetCredentials) ?
                                (displayRequiredFields ?
                                    (jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(props.kcContentWrapperClass) }, { children: [jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(props.kcLabelWrapperClass, "subtitle") }, { children: jsx_runtime_1.jsxs("span", __assign({ className: "subtitle" }, { children: [jsx_runtime_1.jsx("span", __assign({ className: "required" }, { children: "*" }), void 0), msg("requiredFields")] }), void 0) }), void 0),
                                            jsx_runtime_1.jsx("div", __assign({ className: "col-md-10" }, { children: jsx_runtime_1.jsx("h1", __assign({ id: "kc-page-title" }, { children: headerNode }), void 0) }), void 0)] }), void 0))
                                    :
                                        (jsx_runtime_1.jsx("h1", __assign({ id: "kc-page-title" }, { children: headerNode }), void 0))) : (displayRequiredFields ? (jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(props.kcContentWrapperClass) }, { children: [jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(props.kcLabelWrapperClass, "subtitle") }, { children: jsx_runtime_1.jsxs("span", __assign({ className: "subtitle" }, { children: [jsx_runtime_1.jsx("span", __assign({ className: "required" }, { children: "*" }), void 0), " ", msg("requiredFields")] }), void 0) }), void 0),
                                    jsx_runtime_1.jsxs("div", __assign({ className: "col-md-10" }, { children: [showUsernameNode, jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(props.kcFormGroupClass) }, { children: jsx_runtime_1.jsxs("div", __assign({ id: "kc-username" }, { children: [jsx_runtime_1.jsx("label", __assign({ id: "kc-attempted-username" }, { children: auth === null || auth === void 0 ? void 0 : auth.attemptedUsername }), void 0),
                                                        jsx_runtime_1.jsx("a", __assign({ id: "reset-login", href: url.loginRestartFlowUrl }, { children: jsx_runtime_1.jsxs("div", __assign({ className: "kc-login-tooltip" }, { children: [jsx_runtime_1.jsx("i", { className: tss_react_1.cx(props.kcResetFlowIcon) }, void 0),
                                                                    jsx_runtime_1.jsx("span", __assign({ className: "kc-tooltip-text" }, { children: msg("restartLoginTooltip") }), void 0)] }), void 0) }), void 0)] }), void 0) }), void 0)] }), void 0)] }), void 0)) : (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: [showUsernameNode, jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(props.kcFormGroupClass) }, { children: jsx_runtime_1.jsxs("div", __assign({ id: "kc-username" }, { children: [jsx_runtime_1.jsx("label", __assign({ id: "kc-attempted-username" }, { children: auth === null || auth === void 0 ? void 0 : auth.attemptedUsername }), void 0),
                                                jsx_runtime_1.jsx("a", __assign({ id: "reset-login", href: url.loginRestartFlowUrl }, { children: jsx_runtime_1.jsxs("div", __assign({ className: "kc-login-tooltip" }, { children: [jsx_runtime_1.jsx("i", { className: tss_react_1.cx(props.kcResetFlowIcon) }, void 0),
                                                            jsx_runtime_1.jsx("span", __assign({ className: "kc-tooltip-text" }, { children: msg("restartLoginTooltip") }), void 0)] }), void 0) }), void 0)] }), void 0) }), void 0)] }, void 0)))] }), void 0),
                    jsx_runtime_1.jsx("div", __assign({ id: "kc-content" }, { children: jsx_runtime_1.jsxs("div", __assign({ id: "kc-content-wrapper" }, { children: [(displayMessage &&
                                    message !== undefined &&
                                    (message.type !== "warning" ||
                                        !isAppInitiatedAction)) &&
                                    jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx("alert", "alert-" + message.type) }, { children: [message.type === "success" && jsx_runtime_1.jsx("span", { className: tss_react_1.cx(props.kcFeedbackSuccessIcon) }, void 0),
                                            message.type === "warning" && jsx_runtime_1.jsx("span", { className: tss_react_1.cx(props.kcFeedbackWarningIcon) }, void 0),
                                            message.type === "error" && jsx_runtime_1.jsx("span", { className: tss_react_1.cx(props.kcFeedbackErrorIcon) }, void 0),
                                            message.type === "info" && jsx_runtime_1.jsx("span", { className: tss_react_1.cx(props.kcFeedbackInfoIcon) }, void 0),
                                            jsx_runtime_1.jsx("span", __assign({ className: "kc-feedback-text" }, { children: message.summary }), void 0)] }), void 0), formNode, (auth !== undefined &&
                                    auth.showTryAnotherWayLink &&
                                    showAnotherWayIfPresent) &&
                                    jsx_runtime_1.jsx("form", __assign({ id: "kc-select-try-another-way-form", action: url.loginAction, method: "post", className: tss_react_1.cx(displayWide && props.kcContentWrapperClass) }, { children: jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(displayWide && [props.kcFormSocialAccountContentClass, props.kcFormSocialAccountClass]) }, { children: jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(props.kcFormGroupClass) }, { children: [jsx_runtime_1.jsx("input", { type: "hidden", name: "tryAnotherWay", value: "on" }, void 0),
                                                    jsx_runtime_1.jsx("a", __assign({ href: "#", id: "try-another-way", onClick: onTryAnotherWayClick }, { children: msg("doTryAnotherWay") }), void 0)] }), void 0) }), void 0) }), void 0),
                                displayInfo &&
                                    jsx_runtime_1.jsx("div", __assign({ id: "kc-info", className: tss_react_1.cx(props.kcSignUpClass) }, { children: jsx_runtime_1.jsx("div", __assign({ id: "kc-info-wrapper", className: tss_react_1.cx(props.kcInfoAreaWrapperClass) }, { children: infoNode }), void 0) }), void 0)] }), void 0) }), void 0)] }), void 0)] }), void 0));
});
//# sourceMappingURL=Template.js.map