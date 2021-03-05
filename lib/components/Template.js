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
var useKcTranslation_1 = require("../i18n/useKcTranslation");
var kcContext_1 = require("../kcContext");
var assert_1 = require("../tools/assert");
var tss_react_1 = require("tss-react");
var useKcLanguageTag_1 = require("../i18n/useKcLanguageTag");
var KcLanguageTag_1 = require("../i18n/KcLanguageTag");
var powerhooks_1 = require("powerhooks");
var appendHead_1 = require("../tools/appendHead");
var path_1 = require("path");
var powerhooks_2 = require("powerhooks");
var KcProperties_1 = require("./KcProperties");
exports.Template = react_1.memo(function (props) {
    var _a = props.displayInfo, displayInfo = _a === void 0 ? false : _a, _b = props.displayMessage, displayMessage = _b === void 0 ? true : _b, _c = props.displayRequiredFields, displayRequiredFields = _c === void 0 ? false : _c, _d = props.displayWide, displayWide = _d === void 0 ? false : _d, _e = props.showAnotherWayIfPresent, showAnotherWayIfPresent = _e === void 0 ? true : _e, _f = props.kcProperties, kcProperties = _f === void 0 ? {} : _f, headerNode = props.headerNode, _g = props.showUsernameNode, showUsernameNode = _g === void 0 ? null : _g, formNode = props.formNode, _h = props.displayInfoNode, displayInfoNode = _h === void 0 ? null : _h;
    var t = useKcTranslation_1.useKcTranslation().t;
    Object.assign(kcProperties, KcProperties_1.defaultKcTemplateProperties);
    var _j = useKcLanguageTag_1.useKcLanguageTag(), kcLanguageTag = _j.kcLanguageTag, setKcLanguageTag = _j.setKcLanguageTag;
    var onChangeLanguageClickFactory = powerhooks_1.useCallbackFactory(function (_a) {
        var _b = __read(_a, 1), languageTag = _b[0];
        return setKcLanguageTag(languageTag);
    });
    var onTryAnotherWayClick = powerhooks_2.useConstCallback(function () {
        document.forms["kc-select-try-another-way-form"].submit();
        return false;
    });
    var _k = __read(react_1.useState(function () { return (assert_1.assert(kcContext_1.kcContext !== undefined, "App is not currently being served by KeyCloak"),
        kcContext_1.kcContext); }), 1), _l = _k[0], realm = _l.realm, locale = _l.locale, auth = _l.auth, url = _l.url, message = _l.message, isAppInitiatedAction = _l.isAppInitiatedAction;
    var _m = __read(react_1.useReducer(function () { return true; }, false), 2), isExtraCssLoaded = _m[0], setExtraCssLoaded = _m[1];
    react_1.useEffect(function () {
        var _a, _b, _c;
        var isUnmounted = false;
        Promise.all(__spreadArray(__spreadArray([], __read(((_a = kcProperties.stylesCommon) !== null && _a !== void 0 ? _a : []).map(function (relativePath) { return path_1.join(url.resourcesCommonPath, relativePath); }))), __read(((_b = kcProperties.styles) !== null && _b !== void 0 ? _b : []).map(function (relativePath) { return path_1.join(url.resourcesPath, relativePath); }))).map(function (href) { return appendHead_1.appendHead({
            "type": "css",
            href: href
        }); })).then(function () {
            if (isUnmounted) {
                return;
            }
            setExtraCssLoaded();
        });
        (_c = kcProperties.scripts) === null || _c === void 0 ? void 0 : _c.forEach(function (relativePath) { return appendHead_1.appendHead({
            "type": "javascript",
            "src": path_1.join(url.resourcesPath, relativePath)
        }); });
        document.getElementsByTagName("html")[0]
            .classList
            .add(tss_react_1.cx(kcProperties.kcHtmlClass));
        return function () { isUnmounted = true; };
    }, []);
    if (!isExtraCssLoaded) {
        return null;
    }
    return (jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(kcProperties.kcLoginClass) }, { children: [jsx_runtime_1.jsx("div", __assign({ id: "kc-header", className: tss_react_1.cx(kcProperties.kcHeaderClass) }, { children: jsx_runtime_1.jsx("div", __assign({ id: "kc-header-wrapper", className: tss_react_1.cx(kcProperties.kcHeaderWrapperClass) }, { children: t("loginTitleHtml", realm.displayNameHtml) }), void 0) }), void 0),
            jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(kcProperties.kcFormCardClass, displayWide && kcProperties.kcFormCardAccountClass) }, { children: [jsx_runtime_1.jsxs("header", __assign({ className: tss_react_1.cx(kcProperties.kcFormHeaderClass) }, { children: [(realm.internationalizationEnabled &&
                                (assert_1.assert(locale !== undefined), true) &&
                                locale.supported.length > 1) &&
                                jsx_runtime_1.jsx("div", __assign({ id: "kc-locale" }, { children: jsx_runtime_1.jsx("div", __assign({ id: "kc-locale-wrapper", className: tss_react_1.cx(kcProperties.kcLocaleWrapperClass) }, { children: jsx_runtime_1.jsxs("div", __assign({ className: "kc-dropdown", id: "kc-locale-dropdown" }, { children: [jsx_runtime_1.jsx("a", __assign({ href: "#", id: "kc-current-locale-link" }, { children: KcLanguageTag_1.getKcLanguageTagLabel(kcLanguageTag) }), void 0),
                                                jsx_runtime_1.jsx("ul", { children: locale.supported.map(function (_a) {
                                                        var languageTag = _a.languageTag;
                                                        return jsx_runtime_1.jsx("li", __assign({ className: "kc-dropdown-item" }, { children: jsx_runtime_1.jsx("a", __assign({ href: "#", onClick: onChangeLanguageClickFactory(languageTag) }, { children: KcLanguageTag_1.getKcLanguageTagLabel(languageTag) }), void 0) }), void 0);
                                                    }) }, void 0)] }), void 0) }), void 0) }), void 0),
                            !(auth !== undefined &&
                                auth.showUsername &&
                                !auth.showResetCredentials) ?
                                (displayRequiredFields ?
                                    (jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(kcProperties.kcContentWrapperClass) }, { children: [jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(kcProperties.kcLabelWrapperClass, "subtitle") }, { children: jsx_runtime_1.jsxs("span", __assign({ className: "subtitle" }, { children: [jsx_runtime_1.jsx("span", __assign({ className: "required" }, { children: "*" }), void 0), t("requiredFields")] }), void 0) }), void 0),
                                            jsx_runtime_1.jsx("div", __assign({ className: "col-md-10" }, { children: jsx_runtime_1.jsx("h1", __assign({ id: "kc-page-title" }, { children: headerNode }), void 0) }), void 0)] }), void 0))
                                    :
                                        (jsx_runtime_1.jsx("h1", __assign({ id: "kc-page-title" }, { children: headerNode }), void 0))) : (displayRequiredFields ? (jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(kcProperties.kcContentWrapperClass) }, { children: [jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(kcProperties.kcLabelWrapperClass, "subtitle") }, { children: jsx_runtime_1.jsxs("span", __assign({ className: "subtitle" }, { children: [jsx_runtime_1.jsx("span", __assign({ className: "required" }, { children: "*" }), void 0), " ", t("requiredFields")] }), void 0) }), void 0),
                                    jsx_runtime_1.jsxs("div", __assign({ className: "col-md-10" }, { children: [showUsernameNode, jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(kcProperties.kcFormGroupClass) }, { children: jsx_runtime_1.jsxs("div", __assign({ id: "kc-username" }, { children: [jsx_runtime_1.jsx("label", __assign({ id: "kc-attempted-username" }, { children: auth === null || auth === void 0 ? void 0 : auth.attemptedUsername }), void 0),
                                                        jsx_runtime_1.jsx("a", __assign({ id: "reset-login", href: url.loginRestartFlowUrl }, { children: jsx_runtime_1.jsxs("div", __assign({ className: "kc-login-tooltip" }, { children: [jsx_runtime_1.jsx("i", { className: tss_react_1.cx(kcProperties.kcResetFlowIcon) }, void 0),
                                                                    jsx_runtime_1.jsx("span", __assign({ className: "kc-tooltip-text" }, { children: t("restartLoginTooltip") }), void 0)] }), void 0) }), void 0)] }), void 0) }), void 0)] }), void 0)] }), void 0)) : (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: [showUsernameNode, jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(kcProperties.kcFormGroupClass) }, { children: jsx_runtime_1.jsxs("div", __assign({ id: "kc-username" }, { children: [jsx_runtime_1.jsx("label", __assign({ id: "kc-attempted-username" }, { children: auth === null || auth === void 0 ? void 0 : auth.attemptedUsername }), void 0),
                                                jsx_runtime_1.jsx("a", __assign({ id: "reset-login", href: url.loginRestartFlowUrl }, { children: jsx_runtime_1.jsxs("div", __assign({ className: "kc-login-tooltip" }, { children: [jsx_runtime_1.jsx("i", { className: tss_react_1.cx(kcProperties.kcResetFlowIcon) }, void 0),
                                                            jsx_runtime_1.jsx("span", __assign({ className: "kc-tooltip-text" }, { children: t("restartLoginTooltip") }), void 0)] }), void 0) }), void 0)] }), void 0) }), void 0)] }, void 0)))] }), void 0),
                    jsx_runtime_1.jsx("div", __assign({ id: "kc-content" }, { children: jsx_runtime_1.jsxs("div", __assign({ id: "kc-content-wrapper" }, { children: [(displayMessage &&
                                    message !== undefined &&
                                    (message.type !== "warning" ||
                                        !isAppInitiatedAction)) &&
                                    jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx("alert", "alert-" + message.type) }, { children: [message.type === "success" && jsx_runtime_1.jsx("span", { className: tss_react_1.cx(kcProperties.kcFeedbackSuccessIcon) }, void 0),
                                            message.type === "warning" && jsx_runtime_1.jsx("span", { className: tss_react_1.cx(kcProperties.kcFeedbackWarningIcon) }, void 0),
                                            message.type === "error" && jsx_runtime_1.jsx("span", { className: tss_react_1.cx(kcProperties.kcFeedbackErrorIcon) }, void 0),
                                            message.type === "info" && jsx_runtime_1.jsx("span", { className: tss_react_1.cx(kcProperties.kcFeedbackInfoIcon) }, void 0),
                                            jsx_runtime_1.jsx("span", __assign({ className: "kc-feedback-text" }, { children: message.summary }), void 0)] }), void 0), formNode, (auth !== undefined &&
                                    auth.showTryAnotherWayLink &&
                                    showAnotherWayIfPresent) &&
                                    jsx_runtime_1.jsx("form", __assign({ id: "kc-select-try-another-way-form", action: url.loginAction, method: "post", className: tss_react_1.cx(displayWide && kcProperties.kcContentWrapperClass) }, { children: jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(displayWide && [kcProperties.kcFormSocialAccountContentClass, kcProperties.kcFormSocialAccountClass]) }, { children: jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(kcProperties.kcFormGroupClass) }, { children: [jsx_runtime_1.jsx("input", { type: "hidden", name: "tryAnotherWay", value: "on" }, void 0),
                                                    jsx_runtime_1.jsx("a", __assign({ href: "#", id: "try-another-way", onClick: onTryAnotherWayClick }, { children: t("doTryAnotherWay") }), void 0)] }), void 0) }), void 0) }), void 0),
                                displayInfo &&
                                    jsx_runtime_1.jsx("div", __assign({ id: "kc-info", className: tss_react_1.cx(kcProperties.kcSignUpClass) }, { children: jsx_runtime_1.jsx("div", __assign({ id: "kc-info-wrapper", className: tss_react_1.cx(kcProperties.kcInfoAreaWrapperClass) }, { children: displayInfoNode }), void 0) }), void 0)] }), void 0) }), void 0)] }), void 0)] }), void 0));
});
//# sourceMappingURL=Template.js.map