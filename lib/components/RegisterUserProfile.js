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
exports.RegisterUserProfile = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var Template_1 = require("./Template");
var useKcMessage_1 = require("../i18n/useKcMessage");
var tss_react_1 = require("tss-react");
var useCallbackFactory_1 = require("powerhooks/useCallbackFactory");
var useFormValidationSlice_1 = require("../useFormValidationSlice");
exports.RegisterUserProfile = (0, react_1.memo)(function (_a) {
    var kcContext = _a.kcContext, props_ = __rest(_a, ["kcContext"]);
    var url = kcContext.url, messagesPerField = kcContext.messagesPerField, recaptchaRequired = kcContext.recaptchaRequired, recaptchaSiteKey = kcContext.recaptchaSiteKey;
    var _b = (0, useKcMessage_1.useKcMessage)(), msg = _b.msg, msgStr = _b.msgStr;
    var _c = (0, tss_react_1.useCssAndCx)(), cx = _c.cx, css = _c.css;
    var props = (0, react_1.useMemo)(function () { return (__assign(__assign({}, props_), { "kcFormGroupClass": cx(props_.kcFormGroupClass, css({ "marginBottom": 20 })) })); }, [cx, css]);
    var _d = __read((0, react_1.useState)(false), 2), isFomSubmittable = _d[0], setIsFomSubmittable = _d[1];
    return ((0, jsx_runtime_1.jsx)(Template_1.Template, __assign({}, __assign({ kcContext: kcContext }, props), { displayMessage: messagesPerField.exists("global"), displayRequiredFields: true, doFetchDefaultThemeResources: true, headerNode: msg("registerTitle"), formNode: (0, jsx_runtime_1.jsxs)("form", __assign({ id: "kc-register-form", className: cx(props.kcFormClass), action: url.registrationAction, method: "post" }, { children: [(0, jsx_runtime_1.jsx)(UserProfileFormFields, __assign({ kcContext: kcContext, onIsFormSubmittableValueChange: setIsFomSubmittable }, props), void 0), recaptchaRequired && ((0, jsx_runtime_1.jsx)("div", __assign({ className: "form-group" }, { children: (0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcInputWrapperClass) }, { children: (0, jsx_runtime_1.jsx)("div", { className: "g-recaptcha", "data-size": "compact", "data-sitekey": recaptchaSiteKey }, void 0) }), void 0) }), void 0)), (0, jsx_runtime_1.jsxs)("div", __assign({ className: cx(props.kcFormGroupClass) }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ id: "kc-form-options", className: cx(props.kcFormOptionsClass) }, { children: (0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcFormOptionsWrapperClass) }, { children: (0, jsx_runtime_1.jsx)("span", { children: (0, jsx_runtime_1.jsx)("a", __assign({ href: url.loginUrl }, { children: msg("backToLogin") }), void 0) }, void 0) }), void 0) }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ id: "kc-form-buttons", className: cx(props.kcFormButtonsClass) }, { children: (0, jsx_runtime_1.jsx)("input", { className: cx(props.kcButtonClass, props.kcButtonPrimaryClass, props.kcButtonBlockClass, props.kcButtonLargeClass), type: "submit", value: msgStr("doRegister"), disabled: !isFomSubmittable }, void 0) }), void 0)] }), void 0)] }), void 0) }), void 0));
});
var UserProfileFormFields = (0, react_1.memo)(function (_a) {
    var kcContext = _a.kcContext, onIsFormSubmittableValueChange = _a.onIsFormSubmittableValueChange, props = __rest(_a, ["kcContext", "onIsFormSubmittableValueChange"]);
    var _b = (0, tss_react_1.useCssAndCx)(), cx = _b.cx, css = _b.css;
    var advancedMsg = (0, useKcMessage_1.useKcMessage)().advancedMsg;
    var _c = (0, useFormValidationSlice_1.useFormValidationSlice)({
        kcContext: kcContext,
    }), _d = _c.formValidationState, fieldStateByAttributeName = _d.fieldStateByAttributeName, isFormSubmittable = _d.isFormSubmittable, formValidationReducer = _c.formValidationReducer, attributesWithPassword = _c.attributesWithPassword;
    (0, react_1.useEffect)(function () {
        onIsFormSubmittableValueChange(isFormSubmittable);
    }, [isFormSubmittable]);
    var onChangeFactory = (0, useCallbackFactory_1.useCallbackFactory)(function (_a, _b) {
        var _c = __read(_a, 1), name = _c[0];
        var _d = __read(_b, 1), value = _d[0].target.value;
        return formValidationReducer({
            "action": "update value",
            name: name,
            "newValue": value,
        });
    });
    var onBlurFactory = (0, useCallbackFactory_1.useCallbackFactory)(function (_a) {
        var _b = __read(_a, 1), name = _b[0];
        return formValidationReducer({
            "action": "focus lost",
            name: name,
        });
    });
    var currentGroup = "";
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: attributesWithPassword.map(function (attribute, i) {
            var _a;
            var _b = attribute.group, group = _b === void 0 ? "" : _b, _c = attribute.groupDisplayHeader, groupDisplayHeader = _c === void 0 ? "" : _c, _d = attribute.groupDisplayDescription, groupDisplayDescription = _d === void 0 ? "" : _d;
            var _e = fieldStateByAttributeName[attribute.name], value = _e.value, displayableErrors = _e.displayableErrors;
            var formGroupClassName = cx(props.kcFormGroupClass, displayableErrors.length !== 0 && props.kcFormGroupErrorClass);
            return ((0, jsx_runtime_1.jsxs)(react_1.Fragment, { children: [group !== currentGroup && (currentGroup = group) !== "" && ((0, jsx_runtime_1.jsxs)("div", __assign({ className: formGroupClassName }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcContentWrapperClass) }, { children: (0, jsx_runtime_1.jsx)("label", __assign({ id: "header-" + group, className: cx(props.kcFormGroupHeader) }, { children: advancedMsg(groupDisplayHeader) || currentGroup }), void 0) }), void 0), groupDisplayDescription !== "" && ((0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcLabelWrapperClass) }, { children: (0, jsx_runtime_1.jsx)("label", __assign({ id: "description-" + group, className: "" + cx(props.kcLabelClass) }, { children: advancedMsg(groupDisplayDescription) }), void 0) }), void 0))] }), void 0)), (0, jsx_runtime_1.jsxs)("div", __assign({ className: formGroupClassName }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ className: cx(props.kcLabelWrapperClass) }, { children: [(0, jsx_runtime_1.jsx)("label", __assign({ htmlFor: attribute.name, className: cx(props.kcLabelClass) }, { children: advancedMsg((_a = attribute.displayName) !== null && _a !== void 0 ? _a : "") }), void 0), attribute.required && (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: "*" }, void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ className: cx(props.kcInputWrapperClass) }, { children: [(0, jsx_runtime_1.jsx)("input", { type: (function () {
                                            switch (attribute.name) {
                                                case "password-confirm":
                                                case "password":
                                                    return "password";
                                                default:
                                                    return "text";
                                            }
                                        })(), id: attribute.name, name: attribute.name, value: value, onChange: onChangeFactory(attribute.name), className: cx(props.kcInputClass), "aria-invalid": displayableErrors.length !== 0, disabled: attribute.readOnly, autoComplete: attribute.autocomplete, onBlur: onBlurFactory(attribute.name) }, void 0), displayableErrors.length !== 0 && ((0, jsx_runtime_1.jsx)("span", __assign({ id: "input-error-" + attribute.name, className: cx(props.kcInputErrorMessageClass, css({
                                            "position": displayableErrors.length === 1 ? "absolute" : undefined,
                                            "& > span": { "display": "block" },
                                        })), "aria-live": "polite" }, { children: displayableErrors.map(function (_a) {
                                            var errorMessage = _a.errorMessage;
                                            return errorMessage;
                                        }) }), void 0))] }), void 0)] }), void 0)] }, i));
        }) }, void 0));
});
//# sourceMappingURL=RegisterUserProfile.js.map