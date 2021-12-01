/** Class names can be provided as an array or separated by whitespace */
export declare type KcPropsGeneric<CssClasses extends string> = {
    [key in CssClasses]: readonly string[] | string | undefined;
};
export declare type KcTemplateClassKey =
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
export declare type KcTemplateProps = KcPropsGeneric<KcTemplateClassKey>;
export declare const defaultKcTemplateProps: {
    readonly stylesCommon: readonly [
        "node_modules/patternfly/dist/css/patternfly.min.css",
        "node_modules/patternfly/dist/css/patternfly-additions.min.css",
        "lib/zocial/zocial.css",
    ];
    readonly styles: readonly ["css/login.css"];
    readonly scripts: readonly [];
    readonly kcHtmlClass: readonly ["login-pf"];
    readonly kcLoginClass: readonly ["login-pf-page"];
    readonly kcContentWrapperClass: readonly ["row"];
    readonly kcHeaderClass: readonly ["login-pf-page-header"];
    readonly kcHeaderWrapperClass: readonly [];
    readonly kcFormCardClass: readonly ["card-pf"];
    readonly kcFormCardAccountClass: readonly ["login-pf-accounts"];
    readonly kcFormSocialAccountClass: readonly ["login-pf-social-section"];
    readonly kcFormSocialAccountContentClass: readonly ["col-xs-12", "col-sm-6"];
    readonly kcFormHeaderClass: readonly ["login-pf-header"];
    readonly kcLocaleWrapperClass: readonly [];
    readonly kcFeedbackErrorIcon: readonly ["pficon", "pficon-error-circle-o"];
    readonly kcFeedbackWarningIcon: readonly ["pficon", "pficon-warning-triangle-o"];
    readonly kcFeedbackSuccessIcon: readonly ["pficon", "pficon-ok"];
    readonly kcFeedbackInfoIcon: readonly ["pficon", "pficon-info"];
    readonly kcResetFlowIcon: readonly ["pficon", "pficon-arrow fa-2x"];
    readonly kcFormGroupClass: readonly ["form-group"];
    readonly kcLabelWrapperClass: readonly ["col-xs-12", "col-sm-12", "col-md-12", "col-lg-12"];
    readonly kcSignUpClass: readonly ["login-pf-signup"];
    readonly kcInfoAreaWrapperClass: readonly [];
};
/** Tu use if you don't want any default */
export declare const allClearKcTemplateProps: Record<
    | "scripts"
    | "stylesCommon"
    | "styles"
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
    | "kcInfoAreaWrapperClass",
    undefined
>;
export declare type KcProps = KcPropsGeneric<
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
    | "kcSelectAuthListItemInfoClass"
    | "kcSelectAuthListItemLeftClass"
    | "kcSelectAuthListItemBodyClass"
    | "kcSelectAuthListItemDescriptionClass"
    | "kcSelectAuthListItemHeadingClass"
    | "kcSelectAuthListItemHelpTextClass"
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
export declare const defaultKcProps: {
    readonly kcLogoLink: "http://www.keycloak.org";
    readonly kcLogoClass: "login-pf-brand";
    readonly kcContainerClass: "container-fluid";
    readonly kcContentClass: readonly ["col-sm-8", "col-sm-offset-2", "col-md-6", "col-md-offset-3", "col-lg-6", "col-lg-offset-3"];
    readonly kcFeedbackAreaClass: readonly ["col-md-12"];
    readonly kcLocaleClass: readonly ["col-xs-12", "col-sm-1"];
    readonly kcAlertIconClasserror: readonly ["pficon", "pficon-error-circle-o"];
    readonly kcFormAreaClass: readonly ["col-sm-10", "col-sm-offset-1", "col-md-8", "col-md-offset-2", "col-lg-8", "col-lg-offset-2"];
    readonly kcFormSocialAccountListClass: readonly ["login-pf-social", "list-unstyled", "login-pf-social-all"];
    readonly kcFormSocialAccountDoubleListClass: readonly ["login-pf-social-double-col"];
    readonly kcFormSocialAccountListLinkClass: readonly ["login-pf-social-link"];
    readonly kcWebAuthnKeyIcon: readonly ["pficon", "pficon-key"];
    readonly kcFormClass: readonly ["form-horizontal"];
    readonly kcFormGroupErrorClass: readonly ["has-error"];
    readonly kcLabelClass: readonly ["control-label"];
    readonly kcInputClass: readonly ["form-control"];
    readonly kcInputErrorMessageClass: readonly ["pf-c-form__helper-text", "pf-m-error", "required", "kc-feedback-text"];
    readonly kcInputWrapperClass: readonly ["col-xs-12", "col-sm-12", "col-md-12", "col-lg-12"];
    readonly kcFormOptionsClass: readonly ["col-xs-12", "col-sm-12", "col-md-12", "col-lg-12"];
    readonly kcFormButtonsClass: readonly ["col-xs-12", "col-sm-12", "col-md-12", "col-lg-12"];
    readonly kcFormSettingClass: readonly ["login-pf-settings"];
    readonly kcTextareaClass: readonly ["form-control"];
    readonly kcInfoAreaClass: readonly ["col-xs-12", "col-sm-4", "col-md-4", "col-lg-5", "details"];
    readonly kcFormGroupHeader: readonly ["pf-c-form__group"];
    readonly kcButtonClass: readonly ["btn"];
    readonly kcButtonPrimaryClass: readonly ["btn-primary"];
    readonly kcButtonDefaultClass: readonly ["btn-default"];
    readonly kcButtonLargeClass: readonly ["btn-lg"];
    readonly kcButtonBlockClass: readonly ["btn-block"];
    readonly kcInputLargeClass: readonly ["input-lg"];
    readonly kcSrOnlyClass: readonly ["sr-only"];
    readonly kcSelectAuthListClass: readonly ["list-group", "list-view-pf"];
    readonly kcSelectAuthListItemClass: readonly ["list-group-item", "list-view-pf-stacked"];
    readonly kcSelectAuthListItemInfoClass: readonly ["list-view-pf-main-info"];
    readonly kcSelectAuthListItemLeftClass: readonly ["list-view-pf-left"];
    readonly kcSelectAuthListItemBodyClass: readonly ["list-view-pf-body"];
    readonly kcSelectAuthListItemDescriptionClass: readonly ["list-view-pf-description"];
    readonly kcSelectAuthListItemHeadingClass: readonly ["list-group-item-heading"];
    readonly kcSelectAuthListItemHelpTextClass: readonly ["list-group-item-text"];
    readonly kcAuthenticatorDefaultClass: readonly ["fa", "list-view-pf-icon-lg"];
    readonly kcAuthenticatorPasswordClass: readonly ["fa", "fa-unlock list-view-pf-icon-lg"];
    readonly kcAuthenticatorOTPClass: readonly ["fa", "fa-mobile", "list-view-pf-icon-lg"];
    readonly kcAuthenticatorWebAuthnClass: readonly ["fa", "fa-key", "list-view-pf-icon-lg"];
    readonly kcAuthenticatorWebAuthnPasswordlessClass: readonly ["fa", "fa-key", "list-view-pf-icon-lg"];
    readonly kcSelectOTPListClass: readonly ["card-pf", "card-pf-view", "card-pf-view-select", "card-pf-view-single-select"];
    readonly kcSelectOTPListItemClass: readonly ["card-pf-body", "card-pf-top-element"];
    readonly kcAuthenticatorOtpCircleClass: readonly ["fa", "fa-mobile", "card-pf-icon-circle"];
    readonly kcSelectOTPItemHeadingClass: readonly ["card-pf-title", "text-center"];
    readonly kcFormOptionsWrapperClass: readonly [];
    readonly stylesCommon: readonly [
        "node_modules/patternfly/dist/css/patternfly.min.css",
        "node_modules/patternfly/dist/css/patternfly-additions.min.css",
        "lib/zocial/zocial.css",
    ];
    readonly styles: readonly ["css/login.css"];
    readonly scripts: readonly [];
    readonly kcHtmlClass: readonly ["login-pf"];
    readonly kcLoginClass: readonly ["login-pf-page"];
    readonly kcContentWrapperClass: readonly ["row"];
    readonly kcHeaderClass: readonly ["login-pf-page-header"];
    readonly kcHeaderWrapperClass: readonly [];
    readonly kcFormCardClass: readonly ["card-pf"];
    readonly kcFormCardAccountClass: readonly ["login-pf-accounts"];
    readonly kcFormSocialAccountClass: readonly ["login-pf-social-section"];
    readonly kcFormSocialAccountContentClass: readonly ["col-xs-12", "col-sm-6"];
    readonly kcFormHeaderClass: readonly ["login-pf-header"];
    readonly kcLocaleWrapperClass: readonly [];
    readonly kcFeedbackErrorIcon: readonly ["pficon", "pficon-error-circle-o"];
    readonly kcFeedbackWarningIcon: readonly ["pficon", "pficon-warning-triangle-o"];
    readonly kcFeedbackSuccessIcon: readonly ["pficon", "pficon-ok"];
    readonly kcFeedbackInfoIcon: readonly ["pficon", "pficon-info"];
    readonly kcResetFlowIcon: readonly ["pficon", "pficon-arrow fa-2x"];
    readonly kcFormGroupClass: readonly ["form-group"];
    readonly kcLabelWrapperClass: readonly ["col-xs-12", "col-sm-12", "col-md-12", "col-lg-12"];
    readonly kcSignUpClass: readonly ["login-pf-signup"];
    readonly kcInfoAreaWrapperClass: readonly [];
};
/** Tu use if you don't want any default */
export declare const allClearKcProps: Record<
    | "scripts"
    | "stylesCommon"
    | "styles"
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
    | "kcInfoAreaWrapperClass"
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
    | "kcSelectAuthListItemInfoClass"
    | "kcSelectAuthListItemLeftClass"
    | "kcSelectAuthListItemBodyClass"
    | "kcSelectAuthListItemDescriptionClass"
    | "kcSelectAuthListItemHeadingClass"
    | "kcSelectAuthListItemHelpTextClass"
    | "kcAuthenticatorDefaultClass"
    | "kcAuthenticatorPasswordClass"
    | "kcAuthenticatorOTPClass"
    | "kcAuthenticatorWebAuthnClass"
    | "kcAuthenticatorWebAuthnPasswordlessClass"
    | "kcSelectOTPListClass"
    | "kcSelectOTPListItemClass"
    | "kcAuthenticatorOtpCircleClass"
    | "kcSelectOTPItemHeadingClass"
    | "kcFormOptionsWrapperClass",
    undefined
>;
