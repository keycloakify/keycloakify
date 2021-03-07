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
exports.Error = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var Template_1 = require("./Template");
var assert_1 = require("../tools/assert");
var kcContext_1 = require("../kcContext");
var useKcMessage_1 = require("../i18n/useKcMessage");
exports.Error = react_1.memo(function (props) {
    var msg = useKcMessage_1.useKcMessage().msg;
    assert_1.assert(kcContext_1.kcContext !== undefined &&
        kcContext_1.kcContext.pageId === "error.ftl" &&
        kcContext_1.kcContext.message !== undefined);
    var message = kcContext_1.kcContext.message, client = kcContext_1.kcContext.client;
    return (jsx_runtime_1.jsx(Template_1.Template, __assign({}, props, { displayMessage: false, headerNode: msg("errorTitle"), formNode: jsx_runtime_1.jsxs("div", __assign({ id: "kc-error-message" }, { children: [jsx_runtime_1.jsx("p", __assign({ className: "instruction" }, { children: message.summary }), void 0),
                client !== undefined && client.baseUrl !== undefined &&
                    jsx_runtime_1.jsx("p", { children: jsx_runtime_1.jsx("a", __assign({ id: "backToApplication", href: client.baseUrl }, { children: msg("backToApplication") }), void 0) }, void 0)] }), void 0) }), void 0));
});
//# sourceMappingURL=Error.js.map