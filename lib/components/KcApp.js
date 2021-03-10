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
var Info_1 = require("./Info");
var Error_1 = require("./Error");
var LoginResetPassword_1 = require("./LoginResetPassword");
var LoginVerifyEmail_1 = require("./LoginVerifyEmail");
exports.KcApp = react_1.memo(function (_a) {
    var kcContext = _a.kcContext, props = __rest(_a, ["kcContext"]);
    switch (kcContext.pageId) {
        case "login.ftl": return jsx_runtime_1.jsx(Login_1.Login, __assign({}, __assign({ kcContext: kcContext }, props)), void 0);
        case "register.ftl": return jsx_runtime_1.jsx(Register_1.Register, __assign({}, __assign({ kcContext: kcContext }, props)), void 0);
        case "info.ftl": return jsx_runtime_1.jsx(Info_1.Info, __assign({}, __assign({ kcContext: kcContext }, props)), void 0);
        case "error.ftl": return jsx_runtime_1.jsx(Error_1.Error, __assign({}, __assign({ kcContext: kcContext }, props)), void 0);
        case "login-reset-password.ftl": return jsx_runtime_1.jsx(LoginResetPassword_1.LoginResetPassword, __assign({}, __assign({ kcContext: kcContext }, props)), void 0);
        case "login-verify-email.ftl": return jsx_runtime_1.jsx(LoginVerifyEmail_1.LoginVerifyEmail, __assign({}, __assign({ kcContext: kcContext }, props)), void 0);
    }
});
//# sourceMappingURL=KcApp.js.map