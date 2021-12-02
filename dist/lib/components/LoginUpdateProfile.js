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
exports.LoginUpdateProfile = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var Template_1 = require("./Template");
var useKcMessage_1 = require("../i18n/useKcMessage");
var tss_react_1 = require("tss-react");
exports.LoginUpdateProfile = (0, react_1.memo)(function (_a) {
    var _b, _c, _d, _e;
    var kcContext = _a.kcContext, props = __rest(_a, ["kcContext"]);
    var cx = (0, tss_react_1.useCssAndCx)().cx;
    var _f = (0, useKcMessage_1.useKcMessage)(), msg = _f.msg, msgStr = _f.msgStr;
    var url = kcContext.url, user = kcContext.user, messagesPerField = kcContext.messagesPerField, isAppInitiatedAction = kcContext.isAppInitiatedAction;
    return ((0, jsx_runtime_1.jsx)(Template_1.Template, __assign({}, __assign({ kcContext: kcContext }, props), { doFetchDefaultThemeResources: true, headerNode: msg("loginProfileTitle"), formNode: (0, jsx_runtime_1.jsxs)("form", __assign({ id: "kc-update-profile-form", className: cx(props.kcFormClass), action: url.loginAction, method: "post" }, { children: [user.editUsernameAllowed && ((0, jsx_runtime_1.jsxs)("div", __assign({ className: cx(props.kcFormGroupClass, messagesPerField.printIfExists("username", props.kcFormGroupErrorClass)) }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcLabelWrapperClass) }, { children: (0, jsx_runtime_1.jsx)("label", __assign({ htmlFor: "username", className: cx(props.kcLabelClass) }, { children: msg("username") }), void 0) }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcInputWrapperClass) }, { children: (0, jsx_runtime_1.jsx)("input", { type: "text", id: "username", name: "username", defaultValue: (_b = user.username) !== null && _b !== void 0 ? _b : "", className: cx(props.kcInputClass) }, void 0) }), void 0)] }), void 0)), (0, jsx_runtime_1.jsxs)("div", __assign({ className: cx(props.kcFormGroupClass, messagesPerField.printIfExists("email", props.kcFormGroupErrorClass)) }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcLabelWrapperClass) }, { children: (0, jsx_runtime_1.jsx)("label", __assign({ htmlFor: "email", className: cx(props.kcLabelClass) }, { children: msg("email") }), void 0) }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcInputWrapperClass) }, { children: (0, jsx_runtime_1.jsx)("input", { type: "text", id: "email", name: "email", defaultValue: (_c = user.email) !== null && _c !== void 0 ? _c : "", className: cx(props.kcInputClass) }, void 0) }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ className: cx(props.kcFormGroupClass, messagesPerField.printIfExists("firstName", props.kcFormGroupErrorClass)) }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcLabelWrapperClass) }, { children: (0, jsx_runtime_1.jsx)("label", __assign({ htmlFor: "firstName", className: cx(props.kcLabelClass) }, { children: msg("firstName") }), void 0) }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcInputWrapperClass) }, { children: (0, jsx_runtime_1.jsx)("input", { type: "text", id: "firstName", name: "firstName", defaultValue: (_d = user.firstName) !== null && _d !== void 0 ? _d : "", className: cx(props.kcInputClass) }, void 0) }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ className: cx(props.kcFormGroupClass, messagesPerField.printIfExists("lastName", props.kcFormGroupErrorClass)) }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcLabelWrapperClass) }, { children: (0, jsx_runtime_1.jsx)("label", __assign({ htmlFor: "lastName", className: cx(props.kcLabelClass) }, { children: msg("lastName") }), void 0) }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcInputWrapperClass) }, { children: (0, jsx_runtime_1.jsx)("input", { type: "text", id: "lastName", name: "lastName", defaultValue: (_e = user.lastName) !== null && _e !== void 0 ? _e : "", className: cx(props.kcInputClass) }, void 0) }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ className: cx(props.kcFormGroupClass) }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ id: "kc-form-options", className: cx(props.kcFormOptionsClass) }, { children: (0, jsx_runtime_1.jsx)("div", { className: cx(props.kcFormOptionsWrapperClass) }, void 0) }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ id: "kc-form-buttons", className: cx(props.kcFormButtonsClass) }, { children: isAppInitiatedAction ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("input", { className: cx(props.kcButtonClass, props.kcButtonPrimaryClass, props.kcButtonLargeClass), type: "submit", defaultValue: msgStr("doSubmit") }, void 0), (0, jsx_runtime_1.jsx)("button", __assign({ className: cx(props.kcButtonClass, props.kcButtonDefaultClass, props.kcButtonLargeClass), type: "submit", name: "cancel-aia", value: "true" }, { children: msg("doCancel") }), void 0)] }, void 0)) : ((0, jsx_runtime_1.jsx)("input", { className: cx(props.kcButtonClass, props.kcButtonPrimaryClass, props.kcButtonBlockClass, props.kcButtonLargeClass), type: "submit", defaultValue: msgStr("doSubmit") }, void 0)) }), void 0)] }), void 0)] }), void 0) }), void 0));
});
//# sourceMappingURL=LoginUpdateProfile.js.map