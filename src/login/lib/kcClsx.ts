import { createGetKcClsx } from "keycloakify/lib/getKcClsx";

export type ClassKey =
    | "kcBodyClass"
    | "kcHeaderWrapperClass"
    | "kcLocaleWrapperClass"
    | "kcInfoAreaWrapperClass"
    | "kcFormButtonsWrapperClass"
    | "kcFormOptionsWrapperClass"
    | "kcCheckboxInputClass"
    | "kcLocaleDropDownClass"
    | "kcLocaleListItemClass"
    | "kcContentWrapperClass"
    | "kcLogoIdP-facebook"
    | "kcAuthenticatorOTPClass"
    | "kcLogoIdP-bitbucket"
    | "kcAuthenticatorWebAuthnClass"
    | "kcWebAuthnDefaultIcon"
    | "kcLogoIdP-stackoverflow"
    | "kcSelectAuthListItemClass"
    | "kcLogoIdP-microsoft"
    | "kcLoginOTPListItemHeaderClass"
    | "kcLocaleItemClass"
    | "kcLoginOTPListItemIconBodyClass"
    | "kcInputHelperTextAfterClass"
    | "kcFormClass"
    | "kcSelectAuthListClass"
    | "kcInputClassRadioCheckboxLabelDisabled"
    | "kcSelectAuthListItemIconClass"
    | "kcRecoveryCodesWarning"
    | "kcFormSettingClass"
    | "kcWebAuthnBLE"
    | "kcInputWrapperClass"
    | "kcSelectAuthListItemArrowIconClass"
    | "kcFeedbackAreaClass"
    | "kcFormPasswordVisibilityButtonClass"
    | "kcLogoIdP-google"
    | "kcCheckLabelClass"
    | "kcSelectAuthListItemFillClass"
    | "kcAuthenticatorDefaultClass"
    | "kcLogoIdP-gitlab"
    | "kcFormAreaClass"
    | "kcFormButtonsClass"
    | "kcInputClassRadioLabel"
    | "kcAuthenticatorWebAuthnPasswordlessClass"
    | "kcSelectAuthListItemHeadingClass"
    | "kcInfoAreaClass"
    | "kcLogoLink"
    | "kcContainerClass"
    | "kcSelectAuthListItemTitle"
    | "kcHtmlClass"
    | "kcLoginOTPListItemTitleClass"
    | "kcLogoIdP-openshift-v4"
    | "kcWebAuthnUnknownIcon"
    | "kcFormSocialAccountNameClass"
    | "kcLogoIdP-openshift-v3"
    | "kcLoginOTPListInputClass"
    | "kcWebAuthnUSB"
    | "kcInputClassRadio"
    | "kcWebAuthnKeyIcon"
    | "kcFeedbackInfoIcon"
    | "kcCommonLogoIdP"
    | "kcRecoveryCodesActions"
    | "kcFormGroupHeader"
    | "kcFormSocialAccountSectionClass"
    | "kcLogoIdP-instagram"
    | "kcAlertClass"
    | "kcHeaderClass"
    | "kcLabelWrapperClass"
    | "kcFormPasswordVisibilityIconShow"
    | "kcFormSocialAccountLinkClass"
    | "kcLocaleMainClass"
    | "kcInputGroup"
    | "kcTextareaClass"
    | "kcButtonBlockClass"
    | "kcButtonClass"
    | "kcWebAuthnNFC"
    | "kcLocaleClass"
    | "kcInputClassCheckboxInput"
    | "kcFeedbackErrorIcon"
    | "kcInputLargeClass"
    | "kcInputErrorMessageClass"
    | "kcRecoveryCodesList"
    | "kcFormSocialAccountListClass"
    | "kcAlertTitleClass"
    | "kcAuthenticatorPasswordClass"
    | "kcCheckInputClass"
    | "kcLogoIdP-linkedin"
    | "kcLogoIdP-twitter"
    | "kcFeedbackWarningIcon"
    | "kcResetFlowIcon"
    | "kcSelectAuthListItemIconPropertyClass"
    | "kcFeedbackSuccessIcon"
    | "kcLoginOTPListClass"
    | "kcSrOnlyClass"
    | "kcFormSocialAccountListGridClass"
    | "kcButtonDefaultClass"
    | "kcFormGroupErrorClass"
    | "kcSelectAuthListItemDescriptionClass"
    | "kcSelectAuthListItemBodyClass"
    | "kcWebAuthnInternal"
    | "kcSelectAuthListItemArrowClass"
    | "kcCheckClass"
    | "kcContentClass"
    | "kcLogoClass"
    | "kcLoginOTPListItemIconClass"
    | "kcLoginClass"
    | "kcSignUpClass"
    | "kcButtonLargeClass"
    | "kcFormCardClass"
    | "kcLocaleListClass"
    | "kcInputClass"
    | "kcFormGroupClass"
    | "kcLogoIdP-paypal"
    | "kcInputClassCheckbox"
    | "kcRecoveryCodesConfirmation"
    | "kcFormPasswordVisibilityIconHide"
    | "kcInputClassRadioInput"
    | "kcFormSocialAccountListButtonClass"
    | "kcInputClassCheckboxLabel"
    | "kcFormOptionsClass"
    | "kcFormHeaderClass"
    | "kcFormSocialAccountGridItem"
    | "kcButtonPrimaryClass"
    | "kcButtonSecondaryClass"
    | "kcInputHelperTextBeforeClass"
    | "kcLogoIdP-github"
    | "kcLabelClass";

export const { getKcClsx } = createGetKcClsx<ClassKey>({
    defaultClasses: {
        kcHtmlClass: "login-pf",
        kcBodyClass: undefined,
        kcHeaderWrapperClass: undefined,
        kcLocaleWrapperClass: undefined,
        kcInfoAreaWrapperClass: undefined,
        kcFormButtonsWrapperClass: undefined,
        kcFormOptionsWrapperClass: undefined,
        kcLocaleDropDownClass: undefined,
        kcLocaleListItemClass: undefined,
        kcContentWrapperClass: undefined,
        kcCheckboxInputClass: undefined,

        "kcLogoIdP-facebook": "fa fa-facebook",
        kcAuthenticatorOTPClass: "fa fa-mobile list-view-pf-icon-lg",
        "kcLogoIdP-bitbucket": "fa fa-bitbucket",
        kcAuthenticatorWebAuthnClass: "fa fa-key list-view-pf-icon-lg",
        kcWebAuthnDefaultIcon: "pficon pficon-key",
        "kcLogoIdP-stackoverflow": "fa fa-stack-overflow",
        kcSelectAuthListItemClass: "pf-l-stack__item select-auth-box-parent pf-l-split",
        "kcLogoIdP-microsoft": "fa fa-windows",
        kcLoginOTPListItemHeaderClass: "pf-c-tile__header",
        kcLocaleItemClass: "pf-c-dropdown__menu-item",
        kcLoginOTPListItemIconBodyClass: "pf-c-tile__icon",
        kcInputHelperTextAfterClass:
            "pf-c-form__helper-text pf-c-form__helper-text-after",
        kcFormClass: "form-horizontal",
        kcSelectAuthListClass: "pf-l-stack select-auth-container",
        kcInputClassRadioCheckboxLabelDisabled: "pf-m-disabled",
        kcSelectAuthListItemIconClass: "pf-l-split__item select-auth-box-icon",
        kcRecoveryCodesWarning: "kc-recovery-codes-warning",
        kcFormSettingClass: "login-pf-settings",
        kcWebAuthnBLE: "fa fa-bluetooth-b",
        kcInputWrapperClass: "col-xs-12 col-sm-12 col-md-12 col-lg-12",
        kcSelectAuthListItemArrowIconClass: "fa fa-angle-right fa-lg",
        kcFeedbackAreaClass: "col-md-12",
        kcFormPasswordVisibilityButtonClass: "pf-c-button pf-m-control",
        "kcLogoIdP-google": "fa fa-google",
        kcCheckLabelClass: "pf-c-check__label",
        kcSelectAuthListItemFillClass: "pf-l-split__item pf-m-fill",
        kcAuthenticatorDefaultClass: "fa fa-list list-view-pf-icon-lg",
        "kcLogoIdP-gitlab": "fa fa-gitlab",
        kcFormAreaClass:
            "col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 col-lg-8 col-lg-offset-2",
        kcFormButtonsClass: "col-xs-12 col-sm-12 col-md-12 col-lg-12",
        kcInputClassRadioLabel: "pf-c-radio__label",
        kcAuthenticatorWebAuthnPasswordlessClass: "fa fa-key list-view-pf-icon-lg",
        kcSelectAuthListItemHeadingClass:
            "pf-l-stack__item select-auth-box-headline pf-c-title",
        kcInfoAreaClass: "col-xs-12 col-sm-4 col-md-4 col-lg-5 details",
        kcLogoLink: "http://www.keycloak.org",
        kcContainerClass: "container-fluid",
        kcSelectAuthListItemTitle: "select-auth-box-paragraph",
        kcLoginOTPListItemTitleClass: "pf-c-tile__title",
        "kcLogoIdP-openshift-v4": "pf-icon pf-icon-openshift",
        kcWebAuthnUnknownIcon: "pficon pficon-key unknown-transport-class",
        kcFormSocialAccountNameClass: "kc-social-provider-name",
        "kcLogoIdP-openshift-v3": "pf-icon pf-icon-openshift",
        kcLoginOTPListInputClass: "pf-c-tile__input",
        kcWebAuthnUSB: "fa fa-usb",
        kcInputClassRadio: "pf-c-radio",
        kcWebAuthnKeyIcon: "pficon pficon-key",
        kcFeedbackInfoIcon: "fa fa-fw fa-info-circle",
        kcCommonLogoIdP: "kc-social-provider-logo kc-social-gray",
        kcRecoveryCodesActions: "kc-recovery-codes-actions",
        kcFormGroupHeader: "pf-c-form__group",
        kcFormSocialAccountSectionClass: "kc-social-section kc-social-gray",
        "kcLogoIdP-instagram": "fa fa-instagram",
        kcAlertClass: "pf-c-alert pf-m-inline",
        kcHeaderClass: "login-pf-page-header",
        kcLabelWrapperClass: "col-xs-12 col-sm-12 col-md-12 col-lg-12",
        kcFormPasswordVisibilityIconShow: "fa fa-eye",
        kcFormSocialAccountLinkClass: "pf-c-login__main-footer-links-item-link",
        kcLocaleMainClass: "pf-c-dropdown",
        kcInputGroup: "pf-c-input-group",
        kcTextareaClass: "form-control",
        kcButtonBlockClass: "pf-m-block",
        kcButtonClass: "pf-c-button",
        kcWebAuthnNFC: "fa fa-wifi",
        kcLocaleClass: "col-xs-12 col-sm-1",
        kcInputClassCheckboxInput: "pf-c-check__input",
        kcFeedbackErrorIcon: "fa fa-fw fa-exclamation-circle",
        kcInputLargeClass: "input-lg",
        kcInputErrorMessageClass:
            "pf-c-form__helper-text pf-m-error required kc-feedback-text",
        kcRecoveryCodesList: "kc-recovery-codes-list",
        kcFormSocialAccountListClass: "pf-c-login__main-footer-links kc-social-links",
        kcAlertTitleClass: "pf-c-alert__title kc-feedback-text",
        kcAuthenticatorPasswordClass: "fa fa-unlock list-view-pf-icon-lg",
        kcCheckInputClass: "pf-c-check__input",
        "kcLogoIdP-linkedin": "fa fa-linkedin",
        "kcLogoIdP-twitter": "fa fa-twitter",
        kcFeedbackWarningIcon: "fa fa-fw fa-exclamation-triangle",
        kcResetFlowIcon: "pficon pficon-arrow fa",
        kcSelectAuthListItemIconPropertyClass: "fa-2x select-auth-box-icon-properties",
        kcFeedbackSuccessIcon: "fa fa-fw fa-check-circle",
        kcLoginOTPListClass: "pf-c-tile",
        kcSrOnlyClass: "sr-only",
        kcFormSocialAccountListGridClass: "pf-l-grid kc-social-grid",
        kcButtonDefaultClass: "btn-default",
        kcFormGroupErrorClass: "has-error",
        kcSelectAuthListItemDescriptionClass: "pf-l-stack__item select-auth-box-desc",
        kcSelectAuthListItemBodyClass: "pf-l-split__item pf-l-stack",
        kcWebAuthnInternal: "pficon pficon-key",
        kcSelectAuthListItemArrowClass: "pf-l-split__item select-auth-box-arrow",
        kcCheckClass: "pf-c-check",
        kcContentClass:
            "col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3 col-lg-6 col-lg-offset-3",
        kcLogoClass: "login-pf-brand",
        kcLoginOTPListItemIconClass: "fa fa-mobile",
        kcLoginClass: "login-pf-page",
        kcSignUpClass: "login-pf-signup",
        kcButtonLargeClass: "btn-lg",
        kcFormCardClass: "card-pf",
        kcLocaleListClass: "pf-c-dropdown__menu pf-m-align-right",
        kcInputClass: "pf-c-form-control",
        kcFormGroupClass: "form-group",
        "kcLogoIdP-paypal": "fa fa-paypal",
        kcInputClassCheckbox: "pf-c-check",
        kcRecoveryCodesConfirmation: "kc-recovery-codes-confirmation",
        kcFormPasswordVisibilityIconHide: "fa fa-eye-slash",
        kcInputClassRadioInput: "pf-c-radio__input",
        kcFormSocialAccountListButtonClass:
            "pf-c-button pf-m-control pf-m-block kc-social-item kc-social-gray",
        kcInputClassCheckboxLabel: "pf-c-check__label",
        kcFormOptionsClass: "col-xs-12 col-sm-12 col-md-12 col-lg-12",
        kcFormHeaderClass: "login-pf-header",
        kcFormSocialAccountGridItem: "pf-l-grid__item",
        kcButtonPrimaryClass: "pf-m-primary",
        kcButtonSecondaryClass: "pf-m-secondary",
        kcInputHelperTextBeforeClass:
            "pf-c-form__helper-text pf-c-form__helper-text-before",
        "kcLogoIdP-github": "fa fa-github",
        kcLabelClass: "pf-c-form__label pf-c-form__label-text"
    }
});

export type KcClsx = ReturnType<typeof getKcClsx>["kcClsx"];
