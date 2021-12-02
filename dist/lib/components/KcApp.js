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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KcApp = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var Login_1 = require("./Login");
var Register_1 = require("./Register");
var RegisterUserProfile_1 = require("./RegisterUserProfile");
var Info_1 = require("./Info");
var Error_1 = require("./Error");
var LoginResetPassword_1 = require("./LoginResetPassword");
var LoginVerifyEmail_1 = require("./LoginVerifyEmail");
var Terms_1 = require("./Terms");
var LoginOtp_1 = require("./LoginOtp");
var LoginUpdateProfile_1 = require("./LoginUpdateProfile");
var LoginIdpLinkConfirm_1 = require("./LoginIdpLinkConfirm");
exports.KcApp = (0, react_1.memo)(function (_a) {
    var kcContext = _a.kcContext, props = __rest(_a, ["kcContext"]);
    switch (kcContext.pageId) {
        case "login.ftl":
            return (0, jsx_runtime_1.jsx)(Login_1.Login, __assign({}, __assign({ kcContext: kcContext }, props)), void 0);
        case "register.ftl":
            return (0, jsx_runtime_1.jsx)(Register_1.Register, __assign({}, __assign({ kcContext: kcContext }, props)), void 0);
        case "register-user-profile.ftl":
            return (0, jsx_runtime_1.jsx)(RegisterUserProfile_1.RegisterUserProfile, __assign({}, __assign({ kcContext: kcContext }, props)), void 0);
        case "info.ftl":
            return (0, jsx_runtime_1.jsx)(Info_1.Info, __assign({}, __assign({ kcContext: kcContext }, props)), void 0);
        case "error.ftl":
            return (0, jsx_runtime_1.jsx)(Error_1.Error, __assign({}, __assign({ kcContext: kcContext }, props)), void 0);
        case "login-reset-password.ftl":
            return (0, jsx_runtime_1.jsx)(LoginResetPassword_1.LoginResetPassword, __assign({}, __assign({ kcContext: kcContext }, props)), void 0);
        case "login-verify-email.ftl":
            return (0, jsx_runtime_1.jsx)(LoginVerifyEmail_1.LoginVerifyEmail, __assign({}, __assign({ kcContext: kcContext }, props)), void 0);
        case "terms.ftl":
            return (0, jsx_runtime_1.jsx)(Terms_1.Terms, __assign({}, __assign({ kcContext: kcContext }, props)), void 0);
        case "login-otp.ftl":
            return (0, jsx_runtime_1.jsx)(LoginOtp_1.LoginOtp, __assign({}, __assign({ kcContext: kcContext }, props)), void 0);
        case "login-update-profile.ftl":
            return (0, jsx_runtime_1.jsx)(LoginUpdateProfile_1.LoginUpdateProfile, __assign({}, __assign({ kcContext: kcContext }, props)), void 0);
        case "login-idp-link-confirm.ftl":
            return (0, jsx_runtime_1.jsx)(LoginIdpLinkConfirm_1.LoginIdpLinkConfirm, __assign({}, __assign({ kcContext: kcContext }, props)), void 0);
        case "login-config-totp.ftl":
            return null;
        case "saml-post-form.ftl":
            return null;
        // case "code.ftl":
        //     return null;
        // case "delete-account-confirm.ftl":
        //     return null;
        // case "idp-review-user-profile.ftl":
        //     return null;
        // case "login-config-totp-text.ftl":
        //     return null;
        // case "login-idp-link-email.ftl":
        //     return null;
        // case "login-oauth2-device-verify-user-code.ftl":
        //     return null;
        // case "login-oauth-grant.ftl":
        //     return null;
        // case "login-page-expired.ftl":
        //     return null;
        // case "login-password.ftl":
        //     return null;
        // case "login-update-password.ftl":
        //     return null;
        // case "login-username.ftl":
        //     return null;
        // case "login-verify-email-code-text.ftl":
        //     return null;
        // case "login-x509-info.ftl":
        //     return null;
        // case "select-authenticator.ftl":
        //     return null;
        // case "update-user-profile.ftl":
        //     return null;
        // case "webauthn-authenticate.ftl":
        //     return null;
        // case "webauthn-error.ftl":
        //     return null;
        // case "webauthn-register.ftl":
        //     return null;
    }
});
//# sourceMappingURL=KcApp.js.map