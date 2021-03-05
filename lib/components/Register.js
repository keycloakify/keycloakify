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
exports.Register = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var Template_1 = require("./Template");
var KcProperties_1 = require("./KcProperties");
var assert_1 = require("../tools/assert");
var kcContext_1 = require("../kcContext");
var useKcTranslation_1 = require("../i18n/useKcTranslation");
var tss_react_1 = require("tss-react");
exports.Register = react_1.memo(function (props) {
    var _a, _b, _c, _d;
    var _e = props.kcProperties, kcProperties = _e === void 0 ? {} : _e;
    var _f = useKcTranslation_1.useKcTranslation(), t = _f.t, tStr = _f.tStr;
    Object.assign(kcProperties, KcProperties_1.defaultKcPagesProperties);
    var _g = __read(react_1.useState(function () {
        assert_1.assert(kcContext_1.kcContext !== undefined &&
            kcContext_1.kcContext.pageBasename === "register.ftl");
        return kcContext_1.kcContext;
    }), 1), _h = _g[0], url = _h.url, messagesPerField = _h.messagesPerField, register = _h.register, realm = _h.realm, passwordRequired = _h.passwordRequired, recaptchaRequired = _h.recaptchaRequired, recaptchaSiteKey = _h.recaptchaSiteKey;
    return (jsx_runtime_1.jsx(Template_1.Template, { kcProperties: kcProperties, headerNode: t("registerTitle"), formNode: jsx_runtime_1.jsxs("form", __assign({ id: "kc-register-form", className: tss_react_1.cx(kcProperties.kcFormClass), action: url.registrationAction, method: "post" }, { children: [jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(kcProperties.kcFormGroupClass, messagesPerField.printIfExists('firstName', kcProperties.kcFormGroupErrorClass)) }, { children: [jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(kcProperties.kcLabelWrapperClass) }, { children: jsx_runtime_1.jsx("label", __assign({ htmlFor: "firstName", className: tss_react_1.cx(kcProperties.kcLabelClass) }, { children: t("firstName") }), void 0) }), void 0),
                        jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(kcProperties.kcInputWrapperClass) }, { children: jsx_runtime_1.jsx("input", { type: "text", id: "firstName", className: tss_react_1.cx(kcProperties.kcInputClass), name: "firstName", defaultValue: (_a = register.formData.firstName) !== null && _a !== void 0 ? _a : "" }, void 0) }), void 0)] }), void 0),
                jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(kcProperties.kcFormGroupClass, messagesPerField.printIfExists("lastName", kcProperties.kcFormGroupErrorClass)) }, { children: [jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(kcProperties.kcLabelWrapperClass) }, { children: jsx_runtime_1.jsx("label", __assign({ htmlFor: "lastName", className: tss_react_1.cx(kcProperties.kcLabelClass) }, { children: t("lastName") }), void 0) }), void 0),
                        jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(kcProperties.kcInputWrapperClass) }, { children: jsx_runtime_1.jsx("input", { type: "text", id: "lastName", className: tss_react_1.cx(kcProperties.kcInputClass), name: "lastName", defaultValue: (_b = register.formData.lastName) !== null && _b !== void 0 ? _b : "" }, void 0) }), void 0)] }), void 0),
                jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(kcProperties.kcFormGroupClass, messagesPerField.printIfExists('email', kcProperties.kcFormGroupErrorClass)) }, { children: [jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(kcProperties.kcLabelWrapperClass) }, { children: jsx_runtime_1.jsx("label", __assign({ htmlFor: "email", className: tss_react_1.cx(kcProperties.kcLabelClass) }, { children: t("email") }), void 0) }), void 0),
                        jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(kcProperties.kcInputWrapperClass) }, { children: jsx_runtime_1.jsx("input", { type: "text", id: "email", className: tss_react_1.cx(kcProperties.kcInputClass), name: "email", defaultValue: (_c = register.formData.email) !== null && _c !== void 0 ? _c : "", autoComplete: "email" }, void 0) }), void 0)] }), void 0),
                !realm.registrationEmailAsUsername &&
                    jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(kcProperties.kcFormGroupClass, messagesPerField.printIfExists('username', kcProperties.kcFormGroupErrorClass)) }, { children: [jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(kcProperties.kcLabelWrapperClass) }, { children: jsx_runtime_1.jsx("label", __assign({ htmlFor: "username", className: tss_react_1.cx(kcProperties.kcLabelClass) }, { children: t("username") }), void 0) }), void 0),
                            jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(kcProperties.kcInputWrapperClass) }, { children: jsx_runtime_1.jsx("input", { type: "text", id: "username", className: tss_react_1.cx(kcProperties.kcInputClass), name: "username", defaultValue: (_d = register.formData.username) !== null && _d !== void 0 ? _d : "", autoComplete: "username" }, void 0) }), void 0)] }), void 0),
                passwordRequired &&
                    jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: [jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(kcProperties.kcFormGroupClass, messagesPerField.printIfExists("password", kcProperties.kcFormGroupErrorClass)) }, { children: [jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(kcProperties.kcLabelWrapperClass) }, { children: jsx_runtime_1.jsx("label", __assign({ htmlFor: "password", className: tss_react_1.cx(kcProperties.kcLabelClass) }, { children: t("password") }), void 0) }), void 0),
                                    jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(kcProperties.kcInputWrapperClass) }, { children: jsx_runtime_1.jsx("input", { type: "password", id: "password", className: tss_react_1.cx(kcProperties.kcInputClass), name: "password", autoComplete: "new-password" }, void 0) }), void 0)] }), void 0),
                            jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(kcProperties.kcFormGroupClass, messagesPerField.printIfExists("password-confirm", kcProperties.kcFormGroupErrorClass)) }, { children: [jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(kcProperties.kcLabelWrapperClass) }, { children: jsx_runtime_1.jsx("label", __assign({ htmlFor: "password-confirm", className: tss_react_1.cx(kcProperties.kcLabelClass) }, { children: t("passwordConfirm") }), void 0) }), void 0),
                                    jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(kcProperties.kcInputWrapperClass) }, { children: jsx_runtime_1.jsx("input", { type: "password", id: "password-confirm", className: tss_react_1.cx(kcProperties.kcInputClass), name: "password-confirm" }, void 0) }), void 0)] }), void 0)] }, void 0),
                recaptchaRequired &&
                    jsx_runtime_1.jsx("div", __assign({ className: "form-group" }, { children: jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(kcProperties.kcInputWrapperClass) }, { children: jsx_runtime_1.jsx("div", { className: "g-recaptcha", "data-size": "compact", "data-sitekey": recaptchaSiteKey }, void 0) }), void 0) }), void 0),
                jsx_runtime_1.jsxs("div", __assign({ className: tss_react_1.cx(kcProperties.kcFormGroupClass) }, { children: [jsx_runtime_1.jsx("div", __assign({ id: "kc-form-options", className: tss_react_1.cx(kcProperties.kcFormOptionsClass) }, { children: jsx_runtime_1.jsx("div", __assign({ className: tss_react_1.cx(kcProperties.kcFormOptionsWrapperClass) }, { children: jsx_runtime_1.jsx("span", { children: jsx_runtime_1.jsx("a", __assign({ href: url.loginUrl }, { children: t("backToLogin") }), void 0) }, void 0) }), void 0) }), void 0),
                        jsx_runtime_1.jsx("div", __assign({ id: "kc-form-buttons", className: tss_react_1.cx(kcProperties.kcFormButtonsClass) }, { children: jsx_runtime_1.jsx("input", { className: tss_react_1.cx(kcProperties.kcButtonClass, kcProperties.kcButtonPrimaryClass, kcProperties.kcButtonBlockClass, kcProperties.kcButtonLargeClass), type: "submit", defaultValue: tStr("doRegister") }, void 0) }), void 0)] }), void 0)] }), void 0) }, void 0));
});
//# sourceMappingURL=Register.js.map