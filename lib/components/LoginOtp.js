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
exports.LoginOtp = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var Template_1 = require("./Template");
var useKcMessage_1 = require("../i18n/useKcMessage");
var headInsert_1 = require("../tools/headInsert");
var path_1 = require("path");
var tss_react_1 = require("tss-react");
exports.LoginOtp = (0, react_1.memo)(function (_a) {
    var kcContext = _a.kcContext, props = __rest(_a, ["kcContext"]);
    var otpLogin = kcContext.otpLogin, url = kcContext.url;
    var cx = (0, tss_react_1.useCssAndCx)().cx;
    var _b = (0, useKcMessage_1.useKcMessage)(), msg = _b.msg, msgStr = _b.msgStr;
    (0, react_1.useEffect)(function () {
        var isCleanedUp = false;
        (0, headInsert_1.headInsert)({
            "type": "javascript",
            "src": (0, path_1.join)(kcContext.url.resourcesCommonPath, "node_modules/jquery/dist/jquery.min.js"),
        }).then(function () {
            if (isCleanedUp)
                return;
            evaluateInlineScript();
        });
        return function () {
            isCleanedUp = true;
        };
    }, []);
    return ((0, jsx_runtime_1.jsx)(Template_1.Template, __assign({}, __assign({ kcContext: kcContext }, props), { doFetchDefaultThemeResources: true, headerNode: msg("doLogIn"), formNode: (0, jsx_runtime_1.jsxs)("form", __assign({ id: "kc-otp-login-form", className: cx(props.kcFormClass), action: url.loginAction, method: "post" }, { children: [otpLogin.userOtpCredentials.length > 1 && ((0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcFormGroupClass) }, { children: (0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcInputWrapperClass) }, { children: otpLogin.userOtpCredentials.map(function (otpCredential) { return ((0, jsx_runtime_1.jsxs)("div", __assign({ className: cx(props.kcSelectOTPListClass) }, { children: [(0, jsx_runtime_1.jsx)("input", { type: "hidden", value: "${otpCredential.id}" }, void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ className: cx(props.kcSelectOTPListItemClass) }, { children: [(0, jsx_runtime_1.jsx)("span", { className: cx(props.kcAuthenticatorOtpCircleClass) }, void 0), (0, jsx_runtime_1.jsx)("h2", __assign({ className: cx(props.kcSelectOTPItemHeadingClass) }, { children: otpCredential.userLabel }), void 0)] }), void 0)] }), otpCredential.id)); }) }), void 0) }), void 0)), (0, jsx_runtime_1.jsxs)("div", __assign({ className: cx(props.kcFormGroupClass) }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcLabelWrapperClass) }, { children: (0, jsx_runtime_1.jsx)("label", __assign({ htmlFor: "otp", className: cx(props.kcLabelClass) }, { children: msg("loginOtpOneTime") }), void 0) }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ className: cx(props.kcInputWrapperClass) }, { children: (0, jsx_runtime_1.jsx)("input", { id: "otp", name: "otp", autoComplete: "off", type: "text", className: cx(props.kcInputClass), autoFocus: true }, void 0) }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ className: cx(props.kcFormGroupClass) }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ id: "kc-form-options", className: cx(props.kcFormOptionsClass) }, { children: (0, jsx_runtime_1.jsx)("div", { className: cx(props.kcFormOptionsWrapperClass) }, void 0) }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ id: "kc-form-buttons", className: cx(props.kcFormButtonsClass) }, { children: (0, jsx_runtime_1.jsx)("input", { className: cx(props.kcButtonClass, props.kcButtonPrimaryClass, props.kcButtonBlockClass, props.kcButtonLargeClass), name: "login", id: "kc-login", type: "submit", value: msgStr("doLogIn") }, void 0) }), void 0)] }), void 0)] }), void 0) }), void 0));
});
function evaluateInlineScript() {
    $(document).ready(function () {
        // Card Single Select
        $(".card-pf-view-single-select").click(function () {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                $(this).children().removeAttr("name");
            }
            else {
                $(".card-pf-view-single-select").removeClass("active");
                $(".card-pf-view-single-select").children().removeAttr("name");
                $(this).addClass("active");
                $(this).children().attr("name", "selectedCredentialId");
            }
        });
        var defaultCred = $(".card-pf-view-single-select")[0];
        if (defaultCred) {
            defaultCred.click();
        }
    });
}
//# sourceMappingURL=LoginOtp.js.map