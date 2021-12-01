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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFormValidationSlice = exports.useGetErrors = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
require("./tools/Array.prototype.every");
var react_1 = require("react");
var useKcMessage_1 = require("./i18n/useKcMessage");
var useConstCallback_1 = require("powerhooks/useConstCallback");
var id_1 = require("tsafe/id");
var emailRegExp_1 = require("./tools/emailRegExp");
function useGetErrors(params) {
    var _a = params.kcContext, messagesPerField = _a.messagesPerField, attributes = _a.profile.attributes;
    var _b = (0, useKcMessage_1.useKcMessage)(), msg = _b.msg, msgStr = _b.msgStr, advancedMsg = _b.advancedMsg, advancedMsgStr = _b.advancedMsgStr;
    var getErrors = (0, useConstCallback_1.useConstCallback)(function (params) {
        var _a;
        var name = params.name, fieldValueByAttributeName = params.fieldValueByAttributeName;
        var value = fieldValueByAttributeName[name].value;
        var _b = attributes.find(function (attribute) { return attribute.name === name; }), defaultValue = _b.value, validators = _b.validators;
        block: {
            if (defaultValue !== value) {
                break block;
            }
            var doesErrorExist = void 0;
            try {
                doesErrorExist = messagesPerField.existsError(name);
            }
            catch (_c) {
                break block;
            }
            if (!doesErrorExist) {
                break block;
            }
            var errorMessageStr = messagesPerField.get(name);
            return [
                {
                    "validatorName": undefined,
                    errorMessageStr: errorMessageStr,
                    "errorMessage": (0, jsx_runtime_1.jsx)("span", { children: errorMessageStr }, 0),
                },
            ];
        }
        var errors = [];
        scope: {
            var validatorName = "length";
            var validator = validators[validatorName];
            if (validator === undefined) {
                break scope;
            }
            var _d = validator["ignore.empty.value"], ignoreEmptyValue = _d === void 0 ? false : _d, max = validator.max, min = validator.min;
            if (ignoreEmptyValue && value === "") {
                break scope;
            }
            if (max !== undefined && value.length > parseInt(max)) {
                var msgArgs = ["error-invalid-length-too-long", max];
                errors.push({
                    "errorMessage": (0, jsx_runtime_1.jsx)(react_1.Fragment, { children: msg.apply(void 0, __spreadArray([], __read(msgArgs), false)) }, errors.length),
                    "errorMessageStr": msgStr.apply(void 0, __spreadArray([], __read(msgArgs), false)),
                    validatorName: validatorName,
                });
            }
            if (min !== undefined && value.length < parseInt(min)) {
                var msgArgs = ["error-invalid-length-too-short", min];
                errors.push({
                    "errorMessage": (0, jsx_runtime_1.jsx)(react_1.Fragment, { children: msg.apply(void 0, __spreadArray([], __read(msgArgs), false)) }, errors.length),
                    "errorMessageStr": msgStr.apply(void 0, __spreadArray([], __read(msgArgs), false)),
                    validatorName: validatorName,
                });
            }
        }
        scope: {
            var validatorName = "_compareToOther";
            var validator = validators[validatorName];
            if (validator === undefined) {
                break scope;
            }
            var _e = validator["ignore.empty.value"], ignoreEmptyValue = _e === void 0 ? false : _e, otherName = validator.name, shouldBe_1 = validator.shouldBe, errorMessageKey = validator["error-message"];
            if (ignoreEmptyValue && value === "") {
                break scope;
            }
            var otherValue_1 = fieldValueByAttributeName[otherName].value;
            var isValid = (function () {
                switch (shouldBe_1) {
                    case "different":
                        return otherValue_1 !== value;
                    case "equal":
                        return otherValue_1 === value;
                }
            })();
            if (isValid) {
                break scope;
            }
            var msgArg = [
                errorMessageKey !== null && errorMessageKey !== void 0 ? errorMessageKey : (0, id_1.id)((function () {
                    switch (shouldBe_1) {
                        case "equal":
                            return "shouldBeEqual";
                        case "different":
                            return "shouldBeDifferent";
                    }
                })()),
                otherName,
                name,
                shouldBe_1,
            ];
            errors.push({
                validatorName: validatorName,
                "errorMessage": (0, jsx_runtime_1.jsx)(react_1.Fragment, { children: advancedMsg.apply(void 0, __spreadArray([], __read(msgArg), false)) }, errors.length),
                "errorMessageStr": advancedMsgStr.apply(void 0, __spreadArray([], __read(msgArg), false)),
            });
        }
        scope: {
            var validatorName = "pattern";
            var validator = validators[validatorName];
            if (validator === undefined) {
                break scope;
            }
            var _f = validator["ignore.empty.value"], ignoreEmptyValue = _f === void 0 ? false : _f, pattern = validator.pattern, errorMessageKey = validator["error-message"];
            if (ignoreEmptyValue && value === "") {
                break scope;
            }
            if (new RegExp(pattern).test(value)) {
                break scope;
            }
            var msgArgs = [errorMessageKey !== null && errorMessageKey !== void 0 ? errorMessageKey : (0, id_1.id)("shouldMatchPattern"), pattern];
            errors.push({
                validatorName: validatorName,
                "errorMessage": (0, jsx_runtime_1.jsx)(react_1.Fragment, { children: advancedMsg.apply(void 0, __spreadArray([], __read(msgArgs), false)) }, errors.length),
                "errorMessageStr": advancedMsgStr.apply(void 0, __spreadArray([], __read(msgArgs), false)),
            });
        }
        scope: {
            if (((_a = __spreadArray([], __read(errors), false).reverse()[0]) === null || _a === void 0 ? void 0 : _a.validatorName) === "pattern") {
                break scope;
            }
            var validatorName = "email";
            var validator = validators[validatorName];
            if (validator === undefined) {
                break scope;
            }
            var _g = validator["ignore.empty.value"], ignoreEmptyValue = _g === void 0 ? false : _g;
            if (ignoreEmptyValue && value === "") {
                break scope;
            }
            if (emailRegExp_1.emailRegexp.test(value)) {
                break scope;
            }
            var msgArgs = ["invalidEmailMessage"];
            errors.push({
                validatorName: validatorName,
                "errorMessage": (0, jsx_runtime_1.jsx)(react_1.Fragment, { children: msg.apply(void 0, __spreadArray([], __read(msgArgs), false)) }, errors.length),
                "errorMessageStr": msgStr.apply(void 0, __spreadArray([], __read(msgArgs), false)),
            });
        }
        scope: {
            var validatorName = "integer";
            var validator = validators[validatorName];
            if (validator === undefined) {
                break scope;
            }
            var _h = validator["ignore.empty.value"], ignoreEmptyValue = _h === void 0 ? false : _h, max = validator.max, min = validator.min;
            if (ignoreEmptyValue && value === "") {
                break scope;
            }
            var intValue = parseInt(value);
            if (isNaN(intValue)) {
                var msgArgs = ["mustBeAnInteger"];
                errors.push({
                    validatorName: validatorName,
                    "errorMessage": (0, jsx_runtime_1.jsx)(react_1.Fragment, { children: msg.apply(void 0, __spreadArray([], __read(msgArgs), false)) }, errors.length),
                    "errorMessageStr": msgStr.apply(void 0, __spreadArray([], __read(msgArgs), false)),
                });
                break scope;
            }
            if (max !== undefined && intValue > parseInt(max)) {
                var msgArgs = ["error-number-out-of-range-too-big", max];
                errors.push({
                    validatorName: validatorName,
                    "errorMessage": (0, jsx_runtime_1.jsx)(react_1.Fragment, { children: msg.apply(void 0, __spreadArray([], __read(msgArgs), false)) }, errors.length),
                    "errorMessageStr": msgStr.apply(void 0, __spreadArray([], __read(msgArgs), false)),
                });
                break scope;
            }
            if (min !== undefined && intValue < parseInt(min)) {
                var msgArgs = ["error-number-out-of-range-too-small", min];
                errors.push({
                    validatorName: validatorName,
                    "errorMessage": (0, jsx_runtime_1.jsx)(react_1.Fragment, { children: msg.apply(void 0, __spreadArray([], __read(msgArgs), false)) }, errors.length),
                    "errorMessageStr": msgStr.apply(void 0, __spreadArray([], __read(msgArgs), false)),
                });
                break scope;
            }
        }
        //TODO: Implement missing validators.
        return errors;
    });
    return { getErrors: getErrors };
}
exports.useGetErrors = useGetErrors;
function useFormValidationSlice(params) {
    var kcContext = params.kcContext, _a = params.passwordValidators, passwordValidators = _a === void 0 ? {
        "length": {
            "ignore.empty.value": true,
            "min": "4",
        },
    } : _a;
    var attributesWithPassword = (0, react_1.useMemo)(function () {
        return !kcContext.passwordRequired
            ? kcContext.profile.attributes
            : (function () {
                var name = kcContext.realm.registrationEmailAsUsername ? "email" : "username";
                return kcContext.profile.attributes.reduce(function (prev, curr) { return __spreadArray(__spreadArray([], __read(prev), false), __read((curr.name !== name
                    ? [curr]
                    : [
                        curr,
                        (0, id_1.id)({
                            "name": "password",
                            "displayName": (0, id_1.id)("${password}"),
                            "required": true,
                            "readOnly": false,
                            "validators": passwordValidators,
                            "annotations": {},
                            "groupAnnotations": {},
                            "autocomplete": "new-password",
                        }),
                        (0, id_1.id)({
                            "name": "password-confirm",
                            "displayName": (0, id_1.id)("${passwordConfirm}"),
                            "required": true,
                            "readOnly": false,
                            "validators": {
                                "_compareToOther": {
                                    "name": "password",
                                    "ignore.empty.value": true,
                                    "shouldBe": "equal",
                                    "error-message": (0, id_1.id)("${invalidPasswordConfirmMessage}"),
                                },
                            },
                            "annotations": {},
                            "groupAnnotations": {},
                            "autocomplete": "new-password",
                        }),
                    ])), false); }, []);
            })();
    }, [kcContext, passwordValidators]);
    var getErrors = useGetErrors({
        "kcContext": {
            "messagesPerField": kcContext.messagesPerField,
            "profile": {
                "attributes": attributesWithPassword,
            },
        },
    }).getErrors;
    var initialInternalState = (0, react_1.useMemo)(function () {
        return Object.fromEntries(attributesWithPassword
            .map(function (attribute) { return ({
            attribute: attribute,
            "errors": getErrors({
                "name": attribute.name,
                "fieldValueByAttributeName": Object.fromEntries(attributesWithPassword.map(function (_a) {
                    var name = _a.name, value = _a.value;
                    return [name, { "value": value !== null && value !== void 0 ? value : "" }];
                })),
            }),
        }); })
            .map(function (_a) {
            var _b;
            var attribute = _a.attribute, errors = _a.errors;
            return [
                attribute.name,
                {
                    "value": (_b = attribute.value) !== null && _b !== void 0 ? _b : "",
                    errors: errors,
                    "doDisplayPotentialErrorMessages": errors.length !== 0,
                },
            ];
        }));
    }, [attributesWithPassword]);
    var _b = __read((0, react_1.useReducer)(function (state, params) {
        var _a;
        return (__assign(__assign({}, state), (_a = {}, _a[params.name] = __assign(__assign({}, state[params.name]), (function () {
            var _a;
            switch (params.action) {
                case "focus lost":
                    return { "doDisplayPotentialErrorMessages": true };
                case "update value":
                    return {
                        "value": params.newValue,
                        "errors": getErrors({
                            "name": params.name,
                            "fieldValueByAttributeName": __assign(__assign({}, state), (_a = {}, _a[params.name] = { "value": params.newValue }, _a)),
                        }),
                    };
            }
        })()), _a)));
    }, initialInternalState), 2), formValidationInternalState = _b[0], formValidationReducer = _b[1];
    var formValidationState = (0, react_1.useMemo)(function () { return ({
        "fieldStateByAttributeName": Object.fromEntries(Object.entries(formValidationInternalState).map(function (_a) {
            var _b = __read(_a, 2), name = _b[0], _c = _b[1], value = _c.value, errors = _c.errors, doDisplayPotentialErrorMessages = _c.doDisplayPotentialErrorMessages;
            return [
                name,
                { value: value, "displayableErrors": doDisplayPotentialErrorMessages ? errors : [] },
            ];
        })),
        "isFormSubmittable": Object.entries(formValidationInternalState).every(function (_a) {
            var _b = __read(_a, 2), name = _b[0], _c = _b[1], value = _c.value, errors = _c.errors;
            return errors.length === 0 && (value !== "" || !attributesWithPassword.find(function (attribute) { return attribute.name === name; }).required);
        }),
    }); }, [formValidationInternalState, attributesWithPassword]);
    return { formValidationState: formValidationState, formValidationReducer: formValidationReducer, attributesWithPassword: attributesWithPassword };
}
exports.useFormValidationSlice = useFormValidationSlice;
//# sourceMappingURL=useFormValidationSlice.js.map