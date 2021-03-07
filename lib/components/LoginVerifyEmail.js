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
exports.LoginVerifyEmail = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var Template_1 = require("./Template");
var assert_1 = require("../tools/assert");
var kcContext_1 = require("../kcContext");
var useKcMessage_1 = require("../i18n/useKcMessage");
exports.LoginVerifyEmail = react_1.memo(function (props) {
    var msg = useKcMessage_1.useKcMessage().msg;
    assert_1.assert(kcContext_1.kcContext !== undefined &&
        kcContext_1.kcContext.pageId === "login-verify-email.ftl");
    var url = kcContext_1.kcContext.url;
    return (jsx_runtime_1.jsx(Template_1.Template, __assign({}, props, { displayMessage: false, headerNode: msg("emailVerifyTitle"), formNode: jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: [jsx_runtime_1.jsx("p", __assign({ className: "instruction" }, { children: msg("emailVerifyInstruction1") }), void 0),
                jsx_runtime_1.jsxs("p", __assign({ className: "instruction" }, { children: [msg("emailVerifyInstruction2"), jsx_runtime_1.jsx("a", __assign({ href: url.loginAction }, { children: msg("doClickHere") }), void 0), msg("emailVerifyInstruction3")] }), void 0)] }, void 0) }), void 0));
});
//# sourceMappingURL=LoginVerifyEmail.js.map