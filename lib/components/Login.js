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
exports.Login = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var Template_1 = require("./Template");
var assert_1 = require("../tools/assert");
var kcContext_1 = require("../kcContext");
var useKcTranslation_1 = require("../i18n/useKcTranslation");
var tss_react_1 = require("tss-react");
var powerhooks_1 = require("powerhooks");
exports.Login = react_1.memo(function (props) {
    var _a;
    var _b = useKcTranslation_1.useKcTranslation(), t = _b.t, tStr = _b.tStr;
    assert_1.assert(kcContext_1.kcContext !== undefined &&
        kcContext_1.kcContext.pageId === "login.ftl");
    var social = kcContext_1.kcContext.social, realm = kcContext_1.kcContext.realm, url = kcContext_1.kcContext.url, usernameEditDisabled = kcContext_1.kcContext.usernameEditDisabled, login = kcContext_1.kcContext.login, auth = kcContext_1.kcContext.auth, registrationDisabled = kcContext_1.kcContext.registrationDisabled;
    var _c = __read(react_1.useState(false), 2), isLoginButtonDisabled = _c[0], setIsLoginButtonDisabled = _c[1];
    var onSubmit = powerhooks_1.useConstCallback(function () {
        return (setIsLoginButtonDisabled(true), true);
    });
    return (jsx_runtime_1.jsx(Template_1.Template, __assign({}, props, { displayInfo: social.displayInfo, displayWide: realm.password && social.providers !== undefined, headerNode: t("doLogIn"), formNode: jsx_runtime_1.jsxs("div", __assign({ id: "kc-form", className: tss_react_1.cx(realm.password && social.providers !== undefined && props.kcContentWrapperClass) }, { children: [jsx_runtime_1.jsx("div", __assign({ id: "kc-form-wrapper", className: tss_react_1.cx(realm.password && social.providers && [props.kcFormSocialAccountContentClass, props.kcFormSocialAccountClass]) }, { children: realm.password &&
                        (jsx_runtime_1.jsxs("form", __assign({ id: "kc-form-login", onSubmit: onSubmit, action: url.loginAction, method: "post" }, { children: [jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(props.kcFormGroupClass) }, { children: [jsx_runtime_1.jsx("label", __assign({ htmlFor: "username", className: tss_react_1.cx(props.kcLabelClass) }, { children: !realm.loginWithEmailAllowed ?
                                                t("username")
                                                :
                                                    (!realm.registrationEmailAsUsername ?
                                                        t("usernameOrEmail") :
                                                        t("email")) }), void 0),
                                        jsx_runtime_1.jsx("input", __assign({ tabIndex: 1, id: "username", className: tss_react_1.cx(props.kcInputClass), name: "username", defaultValue: (_a = login.username) !== null && _a !== void 0 ? _a : '', type: "text" }, (usernameEditDisabled ? { "disabled": true } : { "autoFocus": true, "autocomplete": "off" })), void 0)] }), void 0),
                                jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(props.kcFormGroupClass) }, { children: [jsx_runtime_1.jsx("label", __assign({ htmlFor: "password", className: tss_react_1.cx(props.kcLabelClass) }, { children: t("password") }), void 0),
                                        jsx_runtime_1.jsx("input", { tabIndex: 2, id: "password", className: tss_react_1.cx(props.kcInputClass), name: "password", type: "password", autoComplete: "off" }, void 0)] }), void 0),
                                jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(props.kcFormGroupClass, props.kcFormSettingClass) }, { children: [jsx_runtime_1.jsx("div", __assign({ id: "kc-form-options" }, { children: (realm.rememberMe &&
                                                !usernameEditDisabled) &&
                                                jsx_runtime_1.jsx("div", __assign({ className: "checkbox" }, { children: jsx_runtime_1.jsxs("label", { children: [jsx_runtime_1.jsx("input", __assign({ tabIndex: 3, id: "rememberMe", name: "rememberMe", type: "checkbox" }, (login.rememberMe ? { "checked": true } : {})), void 0), t("rememberMe")] }, void 0) }), void 0) }), void 0),
                                        jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(props.kcFormOptionsWrapperClass) }, { children: realm.resetPasswordAllowed &&
                                                jsx_runtime_1.jsx("span", { children: jsx_runtime_1.jsx("a", __assign({ tabIndex: 5, href: url.loginResetCredentialsUrl }, { children: t("doForgotPassword") }), void 0) }, void 0) }), void 0)] }), void 0),
                                jsx_runtime_1.jsxs("div", __assign({ id: "kc-form-buttons", className: tss_react_1.cx(props.kcFormGroupClass) }, { children: [jsx_runtime_1.jsx("input", __assign({ type: "hidden", id: "id-hidden-input", name: "credentialId" }, ((auth === null || auth === void 0 ? void 0 : auth.selectedCredential) !== undefined ? { "value": auth.selectedCredential } : {})), void 0),
                                        jsx_runtime_1.jsx("input", { tabIndex: 4, className: tss_react_1.cx(props.kcButtonClass, props.kcButtonPrimaryClass, props.kcButtonBlockClass, props.kcButtonLargeClass), name: "login", id: "kc-login", type: "submit", value: tStr("doLogIn"), disabled: isLoginButtonDisabled }, void 0)] }), void 0)] }), void 0)) }), void 0),
                (realm.password && social.providers !== undefined) &&
                    jsx_runtime_1.jsx("div", __assign({ id: "kc-social-providers", className: tss_react_1.cx(props.kcFormSocialAccountContentClass, props.kcFormSocialAccountClass) }, { children: jsx_runtime_1.jsx("ul", __assign({ className: tss_react_1.cx(props.kcFormSocialAccountListClass, social.providers.length > 4 && props.kcFormSocialAccountDoubleListClass) }, { children: social.providers.map(function (p) {
                                return jsx_runtime_1.jsx("li", __assign({ className: tss_react_1.cx(props.kcFormSocialAccountListLinkClass) }, { children: jsx_runtime_1.jsx("a", __assign({ href: p.loginUrl, id: "zocial-" + p.alias, className: tss_react_1.cx("zocial", p.providerId) }, { children: jsx_runtime_1.jsx("span", { children: p.displayName }, void 0) }), void 0) }), void 0);
                            }) }), void 0) }), void 0)] }), void 0), displayInfoNode: (realm.password &&
            realm.registrationAllowed &&
            !registrationDisabled) &&
            jsx_runtime_1.jsx("div", __assign({ id: "kc-registration" }, { children: jsx_runtime_1.jsxs("span", { children: [t("noAccount"), jsx_runtime_1.jsx("a", __assign({ tabIndex: 6, href: url.registrationUrl }, { children: t("doRegister") }), void 0)] }, void 0) }), void 0) }), void 0));
});
//# sourceMappingURL=Login.js.map