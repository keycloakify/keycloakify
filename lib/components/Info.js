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
exports.Info = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var Template_1 = require("./Template");
var assert_1 = require("../tools/assert");
var kcContext_1 = require("../kcContext");
var useKcTranslation_1 = require("../i18n/useKcTranslation");
exports.Info = react_1.memo(function (props) {
    var t = useKcTranslation_1.useKcTranslation().t;
    assert_1.assert(kcContext_1.kcContext !== undefined &&
        kcContext_1.kcContext.pageId === "info.ftl" &&
        kcContext_1.kcContext.message !== undefined);
    var messageHeader = kcContext_1.kcContext.messageHeader, message = kcContext_1.kcContext.message, requiredActions = kcContext_1.kcContext.requiredActions, skipLink = kcContext_1.kcContext.skipLink, pageRedirectUri = kcContext_1.kcContext.pageRedirectUri, actionUri = kcContext_1.kcContext.actionUri, client = kcContext_1.kcContext.client;
    return (jsx_runtime_1.jsx(Template_1.Template, __assign({}, props, { displayMessage: false, headerNode: messageHeader !== undefined ?
            jsx_runtime_1.jsx(jsx_runtime_1.Fragment, { children: messageHeader }, void 0)
            :
                jsx_runtime_1.jsx(jsx_runtime_1.Fragment, { children: message.summary }, void 0), formNode: jsx_runtime_1.jsxs("div", __assign({ id: "kc-info-message" }, { children: [jsx_runtime_1.jsxs("p", __assign({ className: "instruction" }, { children: [message.summary, requiredActions !== undefined &&
                            jsx_runtime_1.jsx("b", { children: requiredActions
                                    .map(function (requiredAction) { return t("requiredAction." + requiredAction); })
                                    .join(",") }, void 0)] }), void 0),
                !skipLink &&
                    pageRedirectUri !== undefined ?
                    jsx_runtime_1.jsx("p", { children: jsx_runtime_1.jsxs("a", __assign({ href: "${pageRedirectUri}" }, { children: ["$", (t("backToApplication"))] }), void 0) }, void 0)
                    :
                        actionUri !== undefined ?
                            jsx_runtime_1.jsx("p", { children: jsx_runtime_1.jsxs("a", __assign({ href: "${actionUri}" }, { children: ["$", t("proceedWithAction")] }), void 0) }, void 0)
                            :
                                client.baseUrl !== undefined &&
                                    jsx_runtime_1.jsx("p", { children: jsx_runtime_1.jsxs("a", __assign({ href: "${client.baseUrl}" }, { children: ["$", t("backToApplication")] }), void 0) }, void 0)] }), void 0) }), void 0));
});
//# sourceMappingURL=Info.js.map