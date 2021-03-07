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
exports.Register = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var Template_1 = require("./Template");
var assert_1 = require("../tools/assert");
var kcContext_1 = require("../kcContext");
var useKcMessage_1 = require("../i18n/useKcMessage");
var tss_react_1 = require("tss-react");
exports.Register = react_1.memo(function (props) {
    var _a, _b, _c, _d;
    var _e = useKcMessage_1.useKcMessage(), msg = _e.msg, msgStr = _e.msgStr;
    assert_1.assert(kcContext_1.kcContext !== undefined &&
        kcContext_1.kcContext.pageId === "register.ftl");
    var url = kcContext_1.kcContext.url, messagesPerField = kcContext_1.kcContext.messagesPerField, register = kcContext_1.kcContext.register, realm = kcContext_1.kcContext.realm, passwordRequired = kcContext_1.kcContext.passwordRequired, recaptchaRequired = kcContext_1.kcContext.recaptchaRequired, recaptchaSiteKey = kcContext_1.kcContext.recaptchaSiteKey;
    return (jsx_runtime_1.jsx(Template_1.Template, __assign({}, props, { headerNode: msg("registerTitle"), formNode: jsx_runtime_1.jsxs("form", __assign({ id: "kc-register-form", className: tss_react_1.cx(props.kcFormClass), action: url.registrationAction, method: "post" }, { children: [jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(props.kcFormGroupClass, messagesPerField.printIfExists('firstName', props.kcFormGroupErrorClass)) }, { children: [jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(props.kcLabelWrapperClass) }, { children: jsx_runtime_1.jsx("label", __assign({ htmlFor: "firstName", className: tss_react_1.cx(props.kcLabelClass) }, { children: msg("firstName") }), void 0) }), void 0),
                        jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(props.kcInputWrapperClass) }, { children: jsx_runtime_1.jsx("input", { type: "text", id: "firstName", className: tss_react_1.cx(props.kcInputClass), name: "firstName", defaultValue: (_a = register.formData.firstName) !== null && _a !== void 0 ? _a : "" }, void 0) }), void 0)] }), void 0),
                jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(props.kcFormGroupClass, messagesPerField.printIfExists("lastName", props.kcFormGroupErrorClass)) }, { children: [jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(props.kcLabelWrapperClass) }, { children: jsx_runtime_1.jsx("label", __assign({ htmlFor: "lastName", className: tss_react_1.cx(props.kcLabelClass) }, { children: msg("lastName") }), void 0) }), void 0),
                        jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(props.kcInputWrapperClass) }, { children: jsx_runtime_1.jsx("input", { type: "text", id: "lastName", className: tss_react_1.cx(props.kcInputClass), name: "lastName", defaultValue: (_b = register.formData.lastName) !== null && _b !== void 0 ? _b : "" }, void 0) }), void 0)] }), void 0),
                jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(props.kcFormGroupClass, messagesPerField.printIfExists('email', props.kcFormGroupErrorClass)) }, { children: [jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(props.kcLabelWrapperClass) }, { children: jsx_runtime_1.jsx("label", __assign({ htmlFor: "email", className: tss_react_1.cx(props.kcLabelClass) }, { children: msg("email") }), void 0) }), void 0),
                        jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(props.kcInputWrapperClass) }, { children: jsx_runtime_1.jsx("input", { type: "text", id: "email", className: tss_react_1.cx(props.kcInputClass), name: "email", defaultValue: (_c = register.formData.email) !== null && _c !== void 0 ? _c : "", autoComplete: "email" }, void 0) }), void 0)] }), void 0),
                !realm.registrationEmailAsUsername &&
                    jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(props.kcFormGroupClass, messagesPerField.printIfExists('username', props.kcFormGroupErrorClass)) }, { children: [jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(props.kcLabelWrapperClass) }, { children: jsx_runtime_1.jsx("label", __assign({ htmlFor: "username", className: tss_react_1.cx(props.kcLabelClass) }, { children: msg("username") }), void 0) }), void 0),
                            jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(props.kcInputWrapperClass) }, { children: jsx_runtime_1.jsx("input", { type: "text", id: "username", className: tss_react_1.cx(props.kcInputClass), name: "username", defaultValue: (_d = register.formData.username) !== null && _d !== void 0 ? _d : "", autoComplete: "username" }, void 0) }), void 0)] }), void 0),
                passwordRequired &&
                    jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: [jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(props.kcFormGroupClass, messagesPerField.printIfExists("password", props.kcFormGroupErrorClass)) }, { children: [jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(props.kcLabelWrapperClass) }, { children: jsx_runtime_1.jsx("label", __assign({ htmlFor: "password", className: tss_react_1.cx(props.kcLabelClass) }, { children: msg("password") }), void 0) }), void 0),
                                    jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(props.kcInputWrapperClass) }, { children: jsx_runtime_1.jsx("input", { type: "password", id: "password", className: tss_react_1.cx(props.kcInputClass), name: "password", autoComplete: "new-password" }, void 0) }), void 0)] }), void 0),
                            jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(props.kcFormGroupClass, messagesPerField.printIfExists("password-confirm", props.kcFormGroupErrorClass)) }, { children: [jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(props.kcLabelWrapperClass) }, { children: jsx_runtime_1.jsx("label", __assign({ htmlFor: "password-confirm", className: tss_react_1.cx(props.kcLabelClass) }, { children: msg("passwordConfirm") }), void 0) }), void 0),
                                    jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(props.kcInputWrapperClass) }, { children: jsx_runtime_1.jsx("input", { type: "password", id: "password-confirm", className: tss_react_1.cx(props.kcInputClass), name: "password-confirm" }, void 0) }), void 0)] }), void 0)] }, void 0),
                recaptchaRequired &&
                    jsx_runtime_1.jsx("div", __assign({ className: "form-group" }, { children: jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(props.kcInputWrapperClass) }, { children: jsx_runtime_1.jsx("div", { className: "g-recaptcha", "data-size": "compact", "data-sitekey": recaptchaSiteKey }, void 0) }), void 0) }), void 0),
                jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(props.kcFormGroupClass) }, { children: [jsx_runtime_1.jsx("div", __assign({ id: "kc-form-options", className: tss_react_1.cx(props.kcFormOptionsClass) }, { children: jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(props.kcFormOptionsWrapperClass) }, { children: jsx_runtime_1.jsx("span", { children: jsx_runtime_1.jsx("a", __assign({ href: url.loginUrl }, { children: msg("backToLogin") }), void 0) }, void 0) }), void 0) }), void 0),
                        jsx_runtime_1.jsx("div", __assign({ id: "kc-form-buttons", className: tss_react_1.cx(props.kcFormButtonsClass) }, { children: jsx_runtime_1.jsx("input", { className: tss_react_1.cx(props.kcButtonClass, props.kcButtonPrimaryClass, props.kcButtonBlockClass, props.kcButtonLargeClass), type: "submit", defaultValue: msgStr("doRegister") }, void 0) }), void 0)] }), void 0)] }), void 0) }), void 0));
});
//# sourceMappingURL=Register.js.map