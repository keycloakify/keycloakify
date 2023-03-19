import type { LazyExoticComponent } from "react";
import type { I18n } from "keycloakify/login/i18n";
import { type TemplateProps, type TemplateClassKey, defaultTemplateClasses } from "keycloakify/login/TemplateProps";

export type PageProps<KcContext, I18nExtended extends I18n> = {
    Template: LazyExoticComponent<(props: TemplateProps<any, any>) => JSX.Element | null>;
    kcContext: KcContext;
    i18n: I18nExtended;
    doUseDefaultCss: boolean;
    classes?: Partial<Record<TemplateClassKey | ClassKey, string>>;
};

export type ClassKey =
    | TemplateClassKey
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
    | "kcFormOptionsWrapperClass";

export const defaultClasses: Record<ClassKey, string | undefined> = {
    ...defaultTemplateClasses,

    "kcLogoClass": "login-pf-brand",
    "kcContainerClass": "container-fluid",
    "kcContentClass": "col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3 col-lg-6 col-lg-offset-3",
    "kcFeedbackAreaClass": "col-md-12",
    "kcLocaleClass": "col-xs-12 col-sm-1",
    "kcAlertIconClasserror": "pficon pficon-error-circle-o",

    "kcFormAreaClass": "col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 col-lg-8 col-lg-offset-2",
    "kcFormSocialAccountListClass": "login-pf-social list-unstyled login-pf-social-all",
    "kcFormSocialAccountDoubleListClass": "login-pf-social-double-col",
    "kcFormSocialAccountListLinkClass": "login-pf-social-link",
    "kcWebAuthnKeyIcon": "pficon pficon-key",
    "kcWebAuthnDefaultIcon": "pficon pficon-key",

    "kcFormClass": "form-horizontal",
    "kcFormGroupErrorClass": "has-error",
    "kcLabelClass": "control-label",
    "kcInputClass": "form-control",
    "kcInputErrorMessageClass": "pf-c-form__helper-text pf-m-error required kc-feedback-text",
    "kcInputWrapperClass": "col-xs-12 col-sm-12 col-md-12 col-lg-12",
    "kcFormOptionsClass": "col-xs-12 col-sm-12 col-md-12 col-lg-12",
    "kcFormButtonsClass": "col-xs-12 col-sm-12 col-md-12 col-lg-12",
    "kcFormSettingClass": "login-pf-settings",
    "kcTextareaClass": "form-control",

    "kcInfoAreaClass": "col-xs-12 col-sm-4 col-md-4 col-lg-5 details",

    // user-profile grouping
    "kcFormGroupHeader": "pf-c-form__group",

    // css classes for form buttons main class used for all buttons
    "kcButtonClass": "btn",
    // classes defining priority of the button - primary or default (there is typically only one priority button for the form)
    "kcButtonPrimaryClass": "btn-primary",
    "kcButtonDefaultClass": "btn-default",
    // classes defining size of the button
    "kcButtonLargeClass": "btn-lg",
    "kcButtonBlockClass": "btn-block",

    // css classes for input
    "kcInputLargeClass": "input-lg",

    // css classes for form accessability
    "kcSrOnlyClass": "sr-only",

    // css classes for select-authenticator form
    "kcSelectAuthListClass": "list-group list-view-pf",
    "kcSelectAuthListItemClass": "list-group-item list-view-pf-stacked",
    "kcSelectAuthListItemFillClass": "pf-l-split__item pf-m-fill",
    "kcSelectAuthListItemIconPropertyClass": "fa-2x select-auth-box-icon-properties",
    "kcSelectAuthListItemIconClass": "pf-l-split__item select-auth-box-icon",
    "kcSelectAuthListItemTitle": "select-auth-box-paragraph",
    "kcSelectAuthListItemInfoClass": "list-view-pf-main-info",
    "kcSelectAuthListItemLeftClass": "list-view-pf-left",
    "kcSelectAuthListItemBodyClass": "list-view-pf-body",
    "kcSelectAuthListItemDescriptionClass": "list-view-pf-description",
    "kcSelectAuthListItemHeadingClass": "list-group-item-heading",
    "kcSelectAuthListItemHelpTextClass": "list-group-item-text",

    // css classes for the authenticators
    "kcAuthenticatorDefaultClass": "fa list-view-pf-icon-lg",
    "kcAuthenticatorPasswordClass": "fa fa-unlock list-view-pf-icon-lg",
    "kcAuthenticatorOTPClass": "fa fa-mobile list-view-pf-icon-lg",
    "kcAuthenticatorWebAuthnClass": "fa fa-key list-view-pf-icon-lg",
    "kcAuthenticatorWebAuthnPasswordlessClass": "fa fa-key list-view-pf-icon-lg",

    //css classes for the OTP Login Form
    "kcSelectOTPListClass": "card-pf card-pf-view card-pf-view-select card-pf-view-single-select",
    "kcSelectOTPListItemClass": "card-pf-body card-pf-top-element",
    "kcAuthenticatorOtpCircleClass": "fa fa-mobile card-pf-icon-circle",
    "kcSelectOTPItemHeadingClass": "card-pf-title text-center",
    "kcFormOptionsWrapperClass": undefined
};
