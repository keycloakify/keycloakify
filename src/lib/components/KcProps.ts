import { allPropertiesValuesToUndefined } from "../tools/allPropertiesValuesToUndefined";
import { assert } from "tsafe/assert";

/** Class names can be provided as an array or separated by whitespace */
export type KcPropsGeneric<CssClasses extends string> = {
    [key in CssClasses]: readonly string[] | string | undefined;
};

export type KcTemplateClassKey =
    | "stylesCommon"
    | "styles"
    | "scripts"
    | "kcHtmlClass"
    | "kcLoginClass"
    | "kcHeaderClass"
    | "kcHeaderWrapperClass"
    | "kcFormCardClass"
    | "kcFormCardAccountClass"
    | "kcFormHeaderClass"
    | "kcLocaleWrapperClass"
    | "kcContentWrapperClass"
    | "kcLabelWrapperClass"
    | "kcFormGroupClass"
    | "kcResetFlowIcon"
    | "kcFeedbackSuccessIcon"
    | "kcFeedbackWarningIcon"
    | "kcFeedbackErrorIcon"
    | "kcFeedbackInfoIcon"
    | "kcFormSocialAccountContentClass"
    | "kcFormSocialAccountClass"
    | "kcSignUpClass"
    | "kcInfoAreaWrapperClass";

export type KcTemplateProps = KcPropsGeneric<KcTemplateClassKey>;

export const defaultKcTemplateProps = {
    "stylesCommon": [
        "node_modules/patternfly/dist/css/patternfly.min.css",
        "node_modules/patternfly/dist/css/patternfly-additions.min.css",
        "lib/zocial/zocial.css"
    ],
    "styles": ["css/login.css"],
    "scripts": [],
    "kcHtmlClass": ["login-pf"],
    "kcLoginClass": ["login-pf-page"],
    "kcContentWrapperClass": ["row"],
    "kcHeaderClass": ["login-pf-page-header"],
    "kcHeaderWrapperClass": [],
    "kcFormCardClass": ["card-pf"],
    "kcFormCardAccountClass": ["login-pf-accounts"],
    "kcFormSocialAccountClass": ["login-pf-social-section"],
    "kcFormSocialAccountContentClass": ["col-xs-12", "col-sm-6"],
    "kcFormHeaderClass": ["login-pf-header"],
    "kcLocaleWrapperClass": [],
    "kcFeedbackErrorIcon": ["pficon", "pficon-error-circle-o"],
    "kcFeedbackWarningIcon": ["pficon", "pficon-warning-triangle-o"],
    "kcFeedbackSuccessIcon": ["pficon", "pficon-ok"],
    "kcFeedbackInfoIcon": ["pficon", "pficon-info"],
    "kcResetFlowIcon": ["pficon", "pficon-arrow fa-2x"],
    "kcFormGroupClass": ["form-group"],
    "kcLabelWrapperClass": ["col-xs-12", "col-sm-12", "col-md-12", "col-lg-12"],
    "kcSignUpClass": ["login-pf-signup"],
    "kcInfoAreaWrapperClass": []
} as const;

assert<typeof defaultKcTemplateProps extends KcTemplateProps ? true : false>();

/** Tu use if you don't want any default */
export const allClearKcTemplateProps = allPropertiesValuesToUndefined(defaultKcTemplateProps);

assert<typeof allClearKcTemplateProps extends KcTemplateProps ? true : false>();

export type KcProps = KcPropsGeneric<
    | KcTemplateClassKey
    | "kcLogoLink"
    | "kcLogoClass"
    | "kcContainerClass"
    | "kcContentClass"
    | "kcFeedbackAreaClass"
    | "kcLocaleClass"
    | "kcAlertIconClasserror"
    | "kcFormAreaClass"
    | "kcFormSocialAccountListClass"
    | "kcFormSocialAccountDoubleListClass"
    | "kcFormSocialAccountListLinkClass"
    | "kcWebAuthnKeyIcon"
    | "kcWebAuthnDefaultIcon"
    | "kcFormClass"
    | "kcFormGroupErrorClass"
    | "kcLabelClass"
    | "kcInputClass"
    | "kcInputErrorMessageClass"
    | "kcInputWrapperClass"
    | "kcFormOptionsClass"
    | "kcFormButtonsClass"
    | "kcFormSettingClass"
    | "kcTextareaClass"
    | "kcInfoAreaClass"
    | "kcFormGroupHeader"
    | "kcButtonClass"
    | "kcButtonPrimaryClass"
    | "kcButtonDefaultClass"
    | "kcButtonLargeClass"
    | "kcButtonBlockClass"
    | "kcInputLargeClass"
    | "kcSrOnlyClass"
    | "kcSelectAuthListClass"
    | "kcSelectAuthListItemClass"
    | "kcSelectAuthListItemFillClass"
    | "kcSelectAuthListItemInfoClass"
    | "kcSelectAuthListItemLeftClass"
    | "kcSelectAuthListItemBodyClass"
    | "kcSelectAuthListItemDescriptionClass"
    | "kcSelectAuthListItemHeadingClass"
    | "kcSelectAuthListItemHelpTextClass"
    | "kcSelectAuthListItemIconPropertyClass"
    | "kcSelectAuthListItemIconClass"
    | "kcSelectAuthListItemTitle"
    | "kcAuthenticatorDefaultClass"
    | "kcAuthenticatorPasswordClass"
    | "kcAuthenticatorOTPClass"
    | "kcAuthenticatorWebAuthnClass"
    | "kcAuthenticatorWebAuthnPasswordlessClass"
    | "kcSelectOTPListClass"
    | "kcSelectOTPListItemClass"
    | "kcAuthenticatorOtpCircleClass"
    | "kcSelectOTPItemHeadingClass"
    | "kcFormOptionsWrapperClass"
>;

export const defaultKcProps = {
    ...defaultKcTemplateProps,
    "kcLogoLink": "http://www.keycloak.org",
    "kcLogoClass": "login-pf-brand",
    "kcContainerClass": "container-fluid",
    "kcContentClass": ["col-sm-8", "col-sm-offset-2", "col-md-6", "col-md-offset-3", "col-lg-6", "col-lg-offset-3"],
    "kcFeedbackAreaClass": ["col-md-12"],
    "kcLocaleClass": ["col-xs-12", "col-sm-1"],
    "kcAlertIconClasserror": ["pficon", "pficon-error-circle-o"],

    "kcFormAreaClass": ["col-sm-10", "col-sm-offset-1", "col-md-8", "col-md-offset-2", "col-lg-8", "col-lg-offset-2"],
    "kcFormSocialAccountListClass": ["login-pf-social", "list-unstyled", "login-pf-social-all"],
    "kcFormSocialAccountDoubleListClass": ["login-pf-social-double-col"],
    "kcFormSocialAccountListLinkClass": ["login-pf-social-link"],
    "kcWebAuthnKeyIcon": ["pficon", "pficon-key"],
    "kcWebAuthnDefaultIcon": ["pficon", "pficon-key"],

    "kcFormClass": ["form-horizontal"],
    "kcFormGroupErrorClass": ["has-error"],
    "kcLabelClass": ["control-label"],
    "kcInputClass": ["form-control"],
    "kcInputErrorMessageClass": ["pf-c-form__helper-text", "pf-m-error", "required", "kc-feedback-text"],
    "kcInputWrapperClass": ["col-xs-12", "col-sm-12", "col-md-12", "col-lg-12"],
    "kcFormOptionsClass": ["col-xs-12", "col-sm-12", "col-md-12", "col-lg-12"],
    "kcFormButtonsClass": ["col-xs-12", "col-sm-12", "col-md-12", "col-lg-12"],
    "kcFormSettingClass": ["login-pf-settings"],
    "kcTextareaClass": ["form-control"],

    "kcInfoAreaClass": ["col-xs-12", "col-sm-4", "col-md-4", "col-lg-5", "details"],

    // user-profile grouping
    "kcFormGroupHeader": ["pf-c-form__group"],

    // css classes for form buttons main class used for all buttons
    "kcButtonClass": ["btn"],
    // classes defining priority of the button - primary or default (there is typically only one priority button for the form)
    "kcButtonPrimaryClass": ["btn-primary"],
    "kcButtonDefaultClass": ["btn-default"],
    // classes defining size of the button
    "kcButtonLargeClass": ["btn-lg"],
    "kcButtonBlockClass": ["btn-block"],

    // css classes for input
    "kcInputLargeClass": ["input-lg"],

    // css classes for form accessability
    "kcSrOnlyClass": ["sr-only"],

    // css classes for select-authenticator form
    "kcSelectAuthListClass": ["list-group", "list-view-pf"],
    "kcSelectAuthListItemClass": ["list-group-item", "list-view-pf-stacked"],
    "kcSelectAuthListItemFillClass": ["pf-l-split__item", "pf-m-fill"],
    "kcSelectAuthListItemIconPropertyClass": ["fa-2x", "select-auth-box-icon-properties"],
    "kcSelectAuthListItemIconClass": ["pf-l-split__item", "select-auth-box-icon"],
    "kcSelectAuthListItemTitle": ["select-auth-box-paragraph"],
    "kcSelectAuthListItemInfoClass": ["list-view-pf-main-info"],
    "kcSelectAuthListItemLeftClass": ["list-view-pf-left"],
    "kcSelectAuthListItemBodyClass": ["list-view-pf-body"],
    "kcSelectAuthListItemDescriptionClass": ["list-view-pf-description"],
    "kcSelectAuthListItemHeadingClass": ["list-group-item-heading"],
    "kcSelectAuthListItemHelpTextClass": ["list-group-item-text"],

    // css classes for the authenticators
    "kcAuthenticatorDefaultClass": ["fa", "list-view-pf-icon-lg"],
    "kcAuthenticatorPasswordClass": ["fa", "fa-unlock list-view-pf-icon-lg"],
    "kcAuthenticatorOTPClass": ["fa", "fa-mobile", "list-view-pf-icon-lg"],
    "kcAuthenticatorWebAuthnClass": ["fa", "fa-key", "list-view-pf-icon-lg"],
    "kcAuthenticatorWebAuthnPasswordlessClass": ["fa", "fa-key", "list-view-pf-icon-lg"],

    //css classes for the OTP Login Form
    "kcSelectOTPListClass": ["card-pf", "card-pf-view", "card-pf-view-select", "card-pf-view-single-select"],
    "kcSelectOTPListItemClass": ["card-pf-body", "card-pf-top-element"],
    "kcAuthenticatorOtpCircleClass": ["fa", "fa-mobile", "card-pf-icon-circle"],
    "kcSelectOTPItemHeadingClass": ["card-pf-title", "text-center"],
    "kcFormOptionsWrapperClass": []
} as const;

assert<typeof defaultKcProps extends KcProps ? true : false>();

/** Tu use if you don't want any default */
export const allClearKcProps = allPropertiesValuesToUndefined(defaultKcProps);

assert<typeof allClearKcProps extends KcProps ? true : false>();
