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
exports.Error = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var Template_1 = require("./Template");
var assert_1 = require("../tools/assert");
var useKcMessage_1 = require("../i18n/useKcMessage");
exports.Error = react_1.memo(function (_a) {
    var kcContext = _a.kcContext, props = __rest(_a, ["kcContext"]);
    var msg = useKcMessage_1.useKcMessage().msg;
    assert_1.assert(kcContext.message !== undefined);
    var message = kcContext.message, client = kcContext.client;
    return (jsx_runtime_1.jsx(Template_1.Template, __assign({}, __assign({ kcContext: kcContext }, props), { displayMessage: false, headerNode: msg("errorTitle"), formNode: jsx_runtime_1.jsxs("div", __assign({ id: "kc-error-message" }, { children: [jsx_runtime_1.jsx("p", __assign({ className: "instruction" }, { children: message.summary }), void 0),
                client !== undefined && client.baseUrl !== undefined &&
                    jsx_runtime_1.jsx("p", { children: jsx_runtime_1.jsx("a", __assign({ id: "backToApplication", href: client.baseUrl }, { children: msg("backToApplication") }), void 0) }, void 0)] }), void 0) }), void 0));
});
//# sourceMappingURL=Error.js.map