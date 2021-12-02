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
exports.LoginResetPassword = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var Template_1 = require("./Template");
var useKcMessage_1 = require("../i18n/useKcMessage");
var tss_react_1 = require("tss-react");
exports.LoginResetPassword = (0, react_1.memo)(function (_a) {
    var kcContext = _a.kcContext, props = __rest(_a, ["kcContext"]);
    var url = kcContext.url, realm = kcContext.realm, auth = kcContext.auth;
    var _b = (0, useKcMessage_1.useKcMessage)(), msg = _b.msg, msgStr = _b.msgStr;
    var cx = (0, tss_react_1.useCssAndCx)().cx;
    return ((0, jsx_runtime_1.jsx)(Template_1.Template, __assign({}, __assign({ kcContext: kcContext }, props), { doFetchDefaultThemeResources: true, displayMessage: false, headerNode: msg("emailForgotTitle"), formNode: (0, jsx_runtime_1.jsxs)("form", __assign({ id: "kc-reset-password-form", className: cx(props.kcFormClass), action: url.loginAction, method: "post" }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ className: cx(props.kcFormGroupClass) }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcLabelWrapperClass) }, { children: (0, jsx_runtime_1.jsx)("label", __assign({ htmlFor: "username", className: cx(props.kcLabelClass) }, { children: !realm.loginWithEmailAllowed
                                    ? msg("username")
                                    : !realm.registrationEmailAsUsername
                                        ? msg("usernameOrEmail")
                                        : msg("email") }), void 0) }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcInputWrapperClass) }, { children: (0, jsx_runtime_1.jsx)("input", { type: "text", id: "username", name: "username", className: cx(props.kcInputClass), autoFocus: true, defaultValue: auth !== undefined && auth.showUsername ? auth.attemptedUsername : undefined }, void 0) }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ className: cx(props.kcFormGroupClass, props.kcFormSettingClass) }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ id: "kc-form-options", className: cx(props.kcFormOptionsClass) }, { children: (0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcFormOptionsWrapperClass) }, { children: (0, jsx_runtime_1.jsx)("span", { children: (0, jsx_runtime_1.jsx)("a", __assign({ href: url.loginUrl }, { children: msg("backToLogin") }), void 0) }, void 0) }), void 0) }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ id: "kc-form-buttons", className: cx(props.kcFormButtonsClass) }, { children: (0, jsx_runtime_1.jsx)("input", { className: cx(props.kcButtonClass, props.kcButtonPrimaryClass, props.kcButtonBlockClass, props.kcButtonLargeClass), type: "submit", value: msgStr("doSubmit") }, void 0) }), void 0)] }), void 0)] }), void 0), infoNode: msg("emailInstruction") }), void 0));
});
//# sourceMappingURL=LoginResetPassword.js.map