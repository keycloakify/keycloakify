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
exports.LoginIdpLinkConfirm = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var Template_1 = require("./Template");
var useKcMessage_1 = require("../i18n/useKcMessage");
var tss_react_1 = require("tss-react");
exports.LoginIdpLinkConfirm = (0, react_1.memo)(function (_a) {
    var kcContext = _a.kcContext, props = __rest(_a, ["kcContext"]);
    var url = kcContext.url, idpAlias = kcContext.idpAlias;
    var msg = (0, useKcMessage_1.useKcMessage)().msg;
    var cx = (0, tss_react_1.useCssAndCx)().cx;
    return ((0, jsx_runtime_1.jsx)(Template_1.Template, __assign({}, __assign({ kcContext: kcContext }, props), { doFetchDefaultThemeResources: true, headerNode: msg("confirmLinkIdpTitle"), formNode: (0, jsx_runtime_1.jsx)("form", __assign({ id: "kc-register-form", action: url.loginAction, method: "post" }, { children: (0, jsx_runtime_1.jsxs)("div", __assign({ className: cx(props.kcFormGroupClass) }, { children: [(0, jsx_runtime_1.jsx)("button", __assign({ type: "submit", className: cx(props.kcButtonClass, props.kcButtonDefaultClass, props.kcButtonBlockClass, props.kcButtonLargeClass), name: "submitAction", id: "updateProfile", value: "updateProfile" }, { children: msg("confirmLinkIdpReviewProfile") }), void 0), (0, jsx_runtime_1.jsx)("button", __assign({ type: "submit", className: cx(props.kcButtonClass, props.kcButtonDefaultClass, props.kcButtonBlockClass, props.kcButtonLargeClass), name: "submitAction", id: "linkAccount", value: "linkAccount" }, { children: msg("confirmLinkIdpContinue", idpAlias) }), void 0)] }), void 0) }), void 0) }), void 0));
});
//# sourceMappingURL=LoginIdpLinkConfirm.js.map