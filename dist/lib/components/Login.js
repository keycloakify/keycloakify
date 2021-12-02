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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
var useKcMessage_1 = require("../i18n/useKcMessage");
var tss_react_1 = require("tss-react");
var useConstCallback_1 = require("powerhooks/useConstCallback");
exports.Login = (0, react_1.memo)(function (_a) {
    var _b;
    var kcContext = _a.kcContext, props = __rest(_a, ["kcContext"]);
    var social = kcContext.social, realm = kcContext.realm, url = kcContext.url, usernameEditDisabled = kcContext.usernameEditDisabled, login = kcContext.login, auth = kcContext.auth, registrationDisabled = kcContext.registrationDisabled;
    var _c = (0, useKcMessage_1.useKcMessage)(), msg = _c.msg, msgStr = _c.msgStr;
    var cx = (0, tss_react_1.useCssAndCx)().cx;
    var _d = __read((0, react_1.useState)(false), 2), isLoginButtonDisabled = _d[0], setIsLoginButtonDisabled = _d[1];
    var onSubmit = (0, useConstCallback_1.useConstCallback)(function () { return (setIsLoginButtonDisabled(true), true); });
    return ((0, jsx_runtime_1.jsx)(Template_1.Template, __assign({}, __assign({ kcContext: kcContext }, props), { doFetchDefaultThemeResources: true, displayInfo: social.displayInfo, displayWide: realm.password && social.providers !== undefined, headerNode: msg("doLogIn"), formNode: (0, jsx_runtime_1.jsxs)("div", __assign({ id: "kc-form", className: cx(realm.password && social.providers !== undefined && props.kcContentWrapperClass) }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ id: "kc-form-wrapper", className: cx(realm.password && social.providers && [props.kcFormSocialAccountContentClass, props.kcFormSocialAccountClass]) }, { children: realm.password && ((0, jsx_runtime_1.jsxs)("form", __assign({ id: "kc-form-login", onSubmit: onSubmit, action: url.loginAction, method: "post" }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ className: cx(props.kcFormGroupClass) }, { children: [(0, jsx_runtime_1.jsx)("label", __assign({ htmlFor: "username", className: cx(props.kcLabelClass) }, { children: !realm.loginWithEmailAllowed
                                            ? msg("username")
                                            : !realm.registrationEmailAsUsername
                                                ? msg("usernameOrEmail")
                                                : msg("email") }), void 0), (0, jsx_runtime_1.jsx)("input", __assign({ tabIndex: 1, id: "username", className: cx(props.kcInputClass), name: "username", defaultValue: (_b = login.username) !== null && _b !== void 0 ? _b : "", type: "text" }, (usernameEditDisabled
                                        ? { "disabled": true }
                                        : {
                                            "autoFocus": true,
                                            "autoComplete": "off",
                                        })), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ className: cx(props.kcFormGroupClass) }, { children: [(0, jsx_runtime_1.jsx)("label", __assign({ htmlFor: "password", className: cx(props.kcLabelClass) }, { children: msg("password") }), void 0), (0, jsx_runtime_1.jsx)("input", { tabIndex: 2, id: "password", className: cx(props.kcInputClass), name: "password", type: "password", autoComplete: "off" }, void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ className: cx(props.kcFormGroupClass, props.kcFormSettingClass) }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ id: "kc-form-options" }, { children: realm.rememberMe && !usernameEditDisabled && ((0, jsx_runtime_1.jsx)("div", __assign({ className: "checkbox" }, { children: (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("input", __assign({ tabIndex: 3, id: "rememberMe", name: "rememberMe", type: "checkbox" }, (login.rememberMe
                                                        ? {
                                                            "checked": true,
                                                        }
                                                        : {})), void 0), msg("rememberMe")] }, void 0) }), void 0)) }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcFormOptionsWrapperClass) }, { children: realm.resetPasswordAllowed && ((0, jsx_runtime_1.jsx)("span", { children: (0, jsx_runtime_1.jsx)("a", __assign({ tabIndex: 5, href: url.loginResetCredentialsUrl }, { children: msg("doForgotPassword") }), void 0) }, void 0)) }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ id: "kc-form-buttons", className: cx(props.kcFormGroupClass) }, { children: [(0, jsx_runtime_1.jsx)("input", __assign({ type: "hidden", id: "id-hidden-input", name: "credentialId" }, ((auth === null || auth === void 0 ? void 0 : auth.selectedCredential) !== undefined
                                        ? {
                                            "value": auth.selectedCredential,
                                        }
                                        : {})), void 0), (0, jsx_runtime_1.jsx)("input", { tabIndex: 4, className: cx(props.kcButtonClass, props.kcButtonPrimaryClass, props.kcButtonBlockClass, props.kcButtonLargeClass), name: "login", id: "kc-login", type: "submit", value: msgStr("doLogIn"), disabled: isLoginButtonDisabled }, void 0)] }), void 0)] }), void 0)) }), void 0), realm.password && social.providers !== undefined && ((0, jsx_runtime_1.jsx)("div", __assign({ id: "kc-social-providers", className: cx(props.kcFormSocialAccountContentClass, props.kcFormSocialAccountClass) }, { children: (0, jsx_runtime_1.jsx)("ul", __assign({ className: cx(props.kcFormSocialAccountListClass, social.providers.length > 4 && props.kcFormSocialAccountDoubleListClass) }, { children: social.providers.map(function (p) { return ((0, jsx_runtime_1.jsx)("li", __assign({ className: cx(props.kcFormSocialAccountListLinkClass) }, { children: (0, jsx_runtime_1.jsx)("a", __assign({ href: p.loginUrl, id: "zocial-" + p.alias, className: cx("zocial", p.providerId) }, { children: (0, jsx_runtime_1.jsx)("span", { children: p.displayName }, void 0) }), void 0) }), p.providerId)); }) }), void 0) }), void 0))] }), void 0), infoNode: realm.password &&
            realm.registrationAllowed &&
            !registrationDisabled && ((0, jsx_runtime_1.jsx)("div", __assign({ id: "kc-registration" }, { children: (0, jsx_runtime_1.jsxs)("span", { children: [msg("noAccount"), (0, jsx_runtime_1.jsx)("a", __assign({ tabIndex: 6, href: url.registrationUrl }, { children: msg("doRegister") }), void 0)] }, void 0) }), void 0)) }), void 0));
});
//# sourceMappingURL=Login.js.map