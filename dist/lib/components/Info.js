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
exports.Info = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var Template_1 = require("./Template");
var assert_1 = require("../tools/assert");
var useKcMessage_1 = require("../i18n/useKcMessage");
exports.Info = (0, react_1.memo)(function (_a) {
    var kcContext = _a.kcContext, props = __rest(_a, ["kcContext"]);
    var msg = (0, useKcMessage_1.useKcMessage)().msg;
    (0, assert_1.assert)(kcContext.message !== undefined);
    var messageHeader = kcContext.messageHeader, message = kcContext.message, requiredActions = kcContext.requiredActions, skipLink = kcContext.skipLink, pageRedirectUri = kcContext.pageRedirectUri, actionUri = kcContext.actionUri, client = kcContext.client;
    return ((0, jsx_runtime_1.jsx)(Template_1.Template, __assign({}, __assign({ kcContext: kcContext }, props), { doFetchDefaultThemeResources: true, displayMessage: false, headerNode: messageHeader !== undefined ? (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: messageHeader }, void 0) : (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: message.summary }, void 0), formNode: (0, jsx_runtime_1.jsxs)("div", __assign({ id: "kc-info-message" }, { children: [(0, jsx_runtime_1.jsxs)("p", __assign({ className: "instruction" }, { children: [message.summary, requiredActions !== undefined && ((0, jsx_runtime_1.jsx)("b", { children: requiredActions.map(function (requiredAction) { return msg("requiredAction." + requiredAction); }).join(",") }, void 0))] }), void 0), !skipLink && pageRedirectUri !== undefined ? ((0, jsx_runtime_1.jsx)("p", { children: (0, jsx_runtime_1.jsx)("a", __assign({ href: pageRedirectUri }, { children: msg("backToApplication") }), void 0) }, void 0)) : actionUri !== undefined ? ((0, jsx_runtime_1.jsx)("p", { children: (0, jsx_runtime_1.jsx)("a", __assign({ href: actionUri }, { children: msg("proceedWithAction") }), void 0) }, void 0)) : (client.baseUrl !== undefined && ((0, jsx_runtime_1.jsx)("p", { children: (0, jsx_runtime_1.jsx)("a", __assign({ href: client.baseUrl }, { children: msg("backToApplication") }), void 0) }, void 0)))] }), void 0) }), void 0));
});
//# sourceMappingURL=Info.js.map