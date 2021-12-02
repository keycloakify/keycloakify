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
exports.Terms = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var Template_1 = require("./Template");
var useKcMessage_1 = require("../i18n/useKcMessage");
var tss_react_1 = require("tss-react");
exports.Terms = (0, react_1.memo)(function (_a) {
    var kcContext = _a.kcContext, props = __rest(_a, ["kcContext"]);
    var _b = (0, useKcMessage_1.useKcMessage)(), msg = _b.msg, msgStr = _b.msgStr;
    var cx = (0, tss_react_1.useCssAndCx)().cx;
    var url = kcContext.url;
    return ((0, jsx_runtime_1.jsx)(Template_1.Template, __assign({}, __assign({ kcContext: kcContext }, props), { doFetchDefaultThemeResources: true, displayMessage: false, headerNode: msg("termsTitle"), formNode: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ id: "kc-terms-text" }, { children: msg("termsText") }), void 0), (0, jsx_runtime_1.jsxs)("form", __assign({ className: "form-actions", action: url.loginAction, method: "POST" }, { children: [(0, jsx_runtime_1.jsx)("input", { className: cx(props.kcButtonClass, props.kcButtonClass, props.kcButtonClass, props.kcButtonPrimaryClass, props.kcButtonLargeClass), name: "accept", id: "kc-accept", type: "submit", value: msgStr("doAccept") }, void 0), (0, jsx_runtime_1.jsx)("input", { className: cx(props.kcButtonClass, props.kcButtonDefaultClass, props.kcButtonLargeClass), name: "cancel", id: "kc-decline", type: "submit", value: msgStr("doDecline") }, void 0)] }), void 0), (0, jsx_runtime_1.jsx)("div", { className: "clearfix" }, void 0)] }, void 0) }), void 0));
});
//# sourceMappingURL=Terms.js.map