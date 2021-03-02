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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Template = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var useKeycloakTranslation_1 = require("./i18n/useKeycloakTranslation");
var keycloakFtlValues_1 = require("./keycloakFtlValues");
var assert_1 = require("evt/tools/typeSafety/assert");
var tss_react_1 = require("tss-react");
var useKeycloakLanguage_1 = require("./i18n/useKeycloakLanguage");
var getLanguageLabel_1 = require("./i18n/getLanguageLabel");
var powerhooks_1 = require("powerhooks");
var appendLinkInHead_1 = require("./tools/appendLinkInHead");
var appendScriptInHead_1 = require("./tools/appendScriptInHead");
var path_1 = require("path");
var powerhooks_2 = require("powerhooks");
function Template(props) {
    var _a = props.displayInfo, displayInfo = _a === void 0 ? false : _a, _b = props.displayMessage, displayMessage = _b === void 0 ? true : _b, _c = props.displayRequiredFields, displayRequiredFields = _c === void 0 ? false : _c, _d = props.displayWide, displayWide = _d === void 0 ? false : _d, _e = props.showAnotherWayIfPresent, showAnotherWayIfPresent = _e === void 0 ? true : _e, _f = props.properties, properties = _f === void 0 ? {} : _f, headerNode = props.headerNode, showUsernameNode = props.showUsernameNode, formNode = props.formNode, displayInfoNode = props.displayInfoNode;
    var t = useKeycloakTranslation_1.useKeycloakThemeTranslation().t;
    var _g = useKeycloakLanguage_1.useKeycloakLanguage(), keycloakLanguage = _g.keycloakLanguage, setKeycloakLanguage = _g.setKeycloakLanguage;
    var onChangeLanguageClickFactory = powerhooks_1.useCallbackFactory(function (_a) {
        var _b = __read(_a, 1), languageTag = _b[0];
        return setKeycloakLanguage(languageTag);
    });
    var onTryAnotherWayClick = powerhooks_2.useConstCallback(function () {
        document.forms["kc-select-try-another-way-form"].submit();
        return false;
    });
    var _h = __read(react_1.useState(function () {
        assert_1.assert(keycloakFtlValues_1.keycloakPagesContext !== undefined);
        return keycloakFtlValues_1.keycloakPagesContext;
    }), 1), _j = _h[0], realm = _j.realm, locale = _j.locale, auth = _j.auth, url = _j.url, message = _j.message, isAppInitiatedAction = _j.isAppInitiatedAction;
    react_1.useEffect(function () {
        var _a, _b, _c;
        (_a = properties.stylesCommon) === null || _a === void 0 ? void 0 : _a.forEach(function (relativePath) {
            return appendLinkInHead_1.appendLinkInHead({ "href": path_1.join(url.resourcesCommonPath, relativePath) });
        });
        (_b = properties.styles) === null || _b === void 0 ? void 0 : _b.forEach(function (relativePath) {
            return appendLinkInHead_1.appendLinkInHead({ "href": path_1.join(url.resourcesPath, relativePath) });
        });
        (_c = properties.scripts) === null || _c === void 0 ? void 0 : _c.forEach(function (relativePath) {
            return appendScriptInHead_1.appendScriptInHead({ "src": path_1.join(url.resourcesPath, relativePath) });
        });
    }, []);
    return (jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(properties.kcLoginClass) }, { children: [jsx_runtime_1.jsx("div", __assign({ id: "kc-header", className: tss_react_1.cx(properties.kcHeaderClass) }, { children: jsx_runtime_1.jsx("div", __assign({ id: "kc-header-wrapper", className: tss_react_1.cx(properties.kcHeaderWrapperClass) }, { children: t("loginTitleHtml", realm.displayNameHtml) }), void 0) }), void 0),
            jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx("kcFormCardClass", displayWide && properties.kcFormCardAccountClass) }, { children: [jsx_runtime_1.jsxs("header", __assign({ className: tss_react_1.cx(properties.kcFormHeaderClass) }, { children: [(realm.internationalizationEnabled &&
                                (assert_1.assert(locale !== undefined), true) &&
                                locale.supported.length > 1) &&
                                jsx_runtime_1.jsx("div", __assign({ id: "kc-locale" }, { children: jsx_runtime_1.jsx("div", __assign({ id: "kc-locale-wrapper", className: tss_react_1.cx(properties.kcLocaleWrapperClass) }, { children: jsx_runtime_1.jsxs("div", __assign({ className: "kc-dropdown", id: "kc-locale-dropdown" }, { children: [jsx_runtime_1.jsx("a", __assign({ href: "#", id: "kc-current-locale-link" }, { children: getLanguageLabel_1.getLanguageLabel(keycloakLanguage) }), void 0),
                                                jsx_runtime_1.jsx("ul", { children: locale.supported.map(function (_a) {
                                                        var languageTag = _a.languageTag;
                                                        return jsx_runtime_1.jsx("li", __assign({ className: "kc-dropdown-item" }, { children: jsx_runtime_1.jsx("a", __assign({ href: "#", onClick: onChangeLanguageClickFactory(languageTag) }, { children: getLanguageLabel_1.getLanguageLabel(languageTag) }), void 0) }), void 0);
                                                    }) }, void 0)] }), void 0) }), void 0) }), void 0),
                            (auth !== undefined &&
                                auth.showUsername &&
                                !auth.showResetCredentials) ?
                                (displayRequiredFields ?
                                    (jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(properties.kcContentWrapperClass) }, { children: [jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(properties.kcLabelWrapperClass, "subtitle") }, { children: jsx_runtime_1.jsxs("span", __assign({ className: "subtitle" }, { children: [jsx_runtime_1.jsx("span", __assign({ className: "required" }, { children: "*" }), void 0), t("requiredFields")] }), void 0) }), void 0),
                                            jsx_runtime_1.jsx("div", __assign({ className: "col-md-10" }, { children: jsx_runtime_1.jsx("h1", __assign({ id: "kc-page-title" }, { children: headerNode }), void 0) }), void 0)] }), void 0))
                                    :
                                        (jsx_runtime_1.jsx("h1", __assign({ id: "kc-page-title" }, { children: headerNode }), void 0))) : (displayRequiredFields ? (jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(properties.kcContentWrapperClass) }, { children: [jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(properties.kcLabelWrapperClass, "subtitle") }, { children: jsx_runtime_1.jsxs("span", __assign({ className: "subtitle" }, { children: [jsx_runtime_1.jsx("span", __assign({ className: "required" }, { children: "*" }), void 0), " ", t("requiredFields")] }), void 0) }), void 0),
                                    jsx_runtime_1.jsxs("div", __assign({ className: "col-md-10" }, { children: [showUsernameNode, jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(properties.kcFormGroupClass) }, { children: jsx_runtime_1.jsxs("div", __assign({ id: "kc-username" }, { children: [jsx_runtime_1.jsx("label", __assign({ id: "kc-attempted-username" }, { children: auth === null || auth === void 0 ? void 0 : auth.attemptedUsername }), void 0),
                                                        jsx_runtime_1.jsx("a", __assign({ id: "reset-login", href: url.loginRestartFlowUrl }, { children: jsx_runtime_1.jsxs("div", __assign({ className: "kc-login-tooltip" }, { children: [jsx_runtime_1.jsx("i", { className: tss_react_1.cx(properties.kcResetFlowIcon) }, void 0),
                                                                    jsx_runtime_1.jsx("span", __assign({ className: "kc-tooltip-text" }, { children: t("restartLoginTooltip") }), void 0)] }), void 0) }), void 0)] }), void 0) }), void 0)] }), void 0)] }), void 0)) : (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: [showUsernameNode, jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(properties.kcFormGroupClass) }, { children: jsx_runtime_1.jsxs("div", __assign({ id: "kc-username" }, { children: [jsx_runtime_1.jsx("label", __assign({ id: "kc-attempted-username" }, { children: auth === null || auth === void 0 ? void 0 : auth.attemptedUsername }), void 0),
                                                jsx_runtime_1.jsx("a", __assign({ id: "reset-login", href: url.loginRestartFlowUrl }, { children: jsx_runtime_1.jsxs("div", __assign({ className: "kc-login-tooltip" }, { children: [jsx_runtime_1.jsx("i", { className: tss_react_1.cx(properties.kcResetFlowIcon) }, void 0),
                                                            jsx_runtime_1.jsx("span", __assign({ className: "kc-tooltip-text" }, { children: t("restartLoginTooltip") }), void 0)] }), void 0) }), void 0)] }), void 0) }), void 0)] }, void 0)))] }), void 0),
                    jsx_runtime_1.jsx("div", __assign({ id: "kc-content" }, { children: jsx_runtime_1.jsxs("div", __assign({ id: "kc-content-wrapper" }, { children: [(displayMessage &&
                                    message !== undefined &&
                                    (message.type !== "warning" ||
                                        !isAppInitiatedAction)) &&
                                    jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx("alert", "alert-" + message.type) }, { children: [message.type === "success" && jsx_runtime_1.jsx("span", { className: tss_react_1.cx(properties.kcFeedbackSuccessIcon) }, void 0),
                                            message.type === "warning" && jsx_runtime_1.jsx("span", { className: tss_react_1.cx(properties.kcFeedbackWarningIcon) }, void 0),
                                            message.type === "error" && jsx_runtime_1.jsx("span", { className: tss_react_1.cx(properties.kcFeedbackErrorIcon) }, void 0),
                                            message.type === "info" && jsx_runtime_1.jsx("span", { className: tss_react_1.cx(properties.kcFeedbackInfoIcon) }, void 0),
                                            jsx_runtime_1.jsx("span", __assign({ className: "kc-feedback-text" }, { children: message.summary }), void 0)] }), void 0), formNode, (auth !== undefined &&
                                    auth.showTryAnotherWayLink &&
                                    showAnotherWayIfPresent) &&
                                    jsx_runtime_1.jsx("form", __assign({ id: "kc-select-try-another-way-form", action: url.loginAction, method: "post", className: tss_react_1.cx(displayWide && properties.kcContentWrapperClass) }, { children: jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(displayWide && [properties.kcFormSocialAccountContentClass, properties.kcFormSocialAccountClass]) }, { children: jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(properties.kcFormGroupClass) }, { children: [jsx_runtime_1.jsx("input", { type: "hidden", name: "tryAnotherWay", value: "on" }, void 0),
                                                    jsx_runtime_1.jsx("a", __assign({ href: "#", id: "try-another-way", onClick: onTryAnotherWayClick }, { children: t("doTryAnotherWay") }), void 0)] }), void 0) }), void 0) }), void 0),
                                displayInfo &&
                                    jsx_runtime_1.jsx("div", __assign({ id: "kc-info", className: tss_react_1.cx(properties.kcSignUpClass) }, { children: jsx_runtime_1.jsx("div", __assign({ id: "kc-info-wrapper", className: tss_react_1.cx(properties.kcInfoAreaWrapperClass) }, { children: displayInfoNode }), void 0) }), void 0)] }), void 0) }), void 0)] }), void 0)] }), void 0));
}
exports.Template = Template;
//# sourceMappingURL=Template.js.map