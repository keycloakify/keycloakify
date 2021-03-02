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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allClearKcLoginPageProperties = exports.defaultKcPagesProperties = exports.allClearKcTemplateProperties = exports.defaultKcTemplateProperties = void 0;
var allPropertiesValuesToUndefined_1 = require("../tools/allPropertiesValuesToUndefined");
exports.defaultKcTemplateProperties = {
    "styles": ["css/login.css"],
    "stylesCommon": __spreadArray(__spreadArray([], __read([".min.css", "-additions.min.css"]
        .map(function (end) { return "node_modules/patternfly/dist/css/patternfly" + end; }))), [
        "lib/zocial/zocial.css"
    ]),
    "kcLoginClass": "login-pf-page",
    "kcContentWrapperClass": "row",
    "kcHeaderClass": "login-pf-page-header",
    "kcFormCardClass": "card-pf",
    "kcFormCardAccountClass": "login-pf-accounts",
    "kcFormSocialAccountClass": "login-pf-social-section",
    "kcFormSocialAccountContentClass": "col-xs-12 col-sm-6",
    "kcFormHeaderClass": "login-pf-header",
    "kcFeedbackErrorIcon": "pficon pficon-error-circle-o",
    "kcFeedbackWarningIcon": "pficon pficon-warning-triangle-o",
    "kcFeedbackSuccessIcon": "pficon pficon-ok",
    "kcFeedbackInfoIcon": "pficon pficon-info",
    "kcResetFlowIcon": "pficon pficon-arrow fa-2x",
    "kcFormGroupClass": "form-group",
    "kcLabelWrapperClass": "col-xs-12 col-sm-12 col-md-12 col-lg-12",
    "kcSignUpClass": "login-pf-sighup"
};
/** Tu use if you don't want any default */
exports.allClearKcTemplateProperties = allPropertiesValuesToUndefined_1.allPropertiesValuesToUndefined(exports.defaultKcTemplateProperties);
exports.defaultKcPagesProperties = __assign(__assign({}, exports.defaultKcTemplateProperties), { "kcLogoLink": "http://www.keycloak.org", "kcLogoClass": "login-pf-brand", "kcContainerClass": "container-fluid", "kcContentClass": "col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3 col-lg-6 col-lg-offset-3", "kcFeedbackAreaClass": "col-md-12", "kcLocaleClass": "col-xs-12 col-sm-1", "kcAlertIconClasserror": "pficon pficon-error-circle-o", "kcFormAreaClass": "col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 col-lg-8 col-lg-offset-2", "kcFormSocialAccountListClass": "login-pf-social list-unstyled login-pf-social-all", "kcFormSocialAccountDoubleListClass": "login-pf-social-double-col", "kcFormSocialAccountListLinkClass": "login-pf-social-link", "kcWebAuthnKeyIcon": "pficon pficon-key", "kcFormClass": "form-horizontal", "kcFormGroupErrorClass": "has-error", "kcLabelClass": "control-label", "kcInputClass": "form-control", "kcInputWrapperClass": "col-xs-12 col-sm-12 col-md-12 col-lg-12", "kcFormOptionsClass": "col-xs-12 col-sm-12 col-md-12 col-lg-12", "kcFormButtonsClass": "col-xs-12 col-sm-12 col-md-12 col-lg-12", "kcFormSettingClass": "login-pf-settings", "kcTextareaClass": "form-control", "kcInfoAreaClass": "col-xs-12 col-sm-4 col-md-4 col-lg-5 details", 
    // css classes for form buttons main class used for all buttons
    "kcButtonClass": "btn", 
    // classes defining priority of the button - primary or default (there is typically only one priority button for the form)
    "kcButtonPrimaryClass": "btn-primary", "kcButtonDefaultClass": "btn-default", 
    // classes defining size of the button
    "kcButtonLargeClass": "btn-lg", "kcButtonBlockClass": "btn-block", 
    // css classes for input
    "kcInputLargeClass": "input-lg", 
    // css classes for form accessability
    "kcSrOnlyClass": "sr-only", 
    // css classes for select-authenticator form
    "kcSelectAuthListClass": "list-group list-view-pf", "kcSelectAuthListItemClass": "list-group-item list-view-pf-stacked", "kcSelectAuthListItemInfoClass": "list-view-pf-main-info", "kcSelectAuthListItemLeftClass": "list-view-pf-left", "kcSelectAuthListItemBodyClass": "list-view-pf-body", "kcSelectAuthListItemDescriptionClass": "list-view-pf-description", "kcSelectAuthListItemHeadingClass": "list-group-item-heading", "kcSelectAuthListItemHelpTextClass": "list-group-item-text", 
    // css classes for the authenticators
    "kcAuthenticatorDefaultClass": "fa list-view-pf-icon-lg", "kcAuthenticatorPasswordClass": "fa fa-unlock list-view-pf-icon-lg", "kcAuthenticatorOTPClass": "fa fa-mobile list-view-pf-icon-lg", "kcAuthenticatorWebAuthnClass": "fa fa-key list-view-pf-icon-lg", "kcAuthenticatorWebAuthnPasswordlessClass": "fa fa-key list-view-pf-icon-lg", 
    //css classes for the OTP Login Form
    "kcSelectOTPListClass": "card-pf card-pf-view card-pf-view-select card-pf-view-single-select", "kcSelectOTPListItemClass": "card-pf-body card-pf-top-element", "kcAuthenticatorOtpCircleClass": "fa fa-mobile card-pf-icon-circle", "kcSelectOTPItemHeadingClass": "card-pf-title text-center" });
/** Tu use if you don't want any default */
exports.allClearKcLoginPageProperties = allPropertiesValuesToUndefined_1.allPropertiesValuesToUndefined(exports.defaultKcPagesProperties);
//# sourceMappingURL=KcProperties.js.map