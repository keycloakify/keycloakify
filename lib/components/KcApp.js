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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KcApp = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var kcContext_1 = require("../kcContext");
var assert_1 = require("../tools/assert");
var Login_1 = require("./Login");
var Register_1 = require("./Register");
var Info_1 = require("./Info");
var Error_1 = require("./Error");
var LoginResetPassword_1 = require("./LoginResetPassword");
var LoginVerifyEmail_1 = require("./LoginVerifyEmail");
exports.KcApp = react_1.memo(function (props) {
    assert_1.assert(kcContext_1.kcContext !== undefined, "App is not currently served by a Keycloak server");
    switch (kcContext_1.kcContext.pageId) {
        case "login.ftl": return jsx_runtime_1.jsx(Login_1.Login, __assign({}, props), void 0);
        case "register.ftl": return jsx_runtime_1.jsx(Register_1.Register, __assign({}, props), void 0);
        case "info.ftl": return jsx_runtime_1.jsx(Info_1.Info, __assign({}, props), void 0);
        case "error.ftl": return jsx_runtime_1.jsx(Error_1.Error, __assign({}, props), void 0);
        case "login-reset-password.ftl": return jsx_runtime_1.jsx(LoginResetPassword_1.LoginResetPassword, __assign({}, props), void 0);
        case "login-verify-email.ftl": return jsx_runtime_1.jsx(LoginVerifyEmail_1.LoginVerifyEmail, __assign({}, props), void 0);
    }
});
//# sourceMappingURL=KcApp.js.map