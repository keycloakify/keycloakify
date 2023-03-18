import type { ReactNode } from "react";
import type { KcContextBase } from "keycloakify/kcContext";
import type { I18nBase } from "keycloakify/i18n";

export type TemplateProps<KcContext extends KcContextBase.Common, I18n extends I18nBase> = {
    kcContext: KcContext;
    i18n: I18n;
    doUseDefaultCss: boolean;
    classes?: Partial<Record<TemplateClassKey, string>>;

    formNode: ReactNode;
    displayInfo?: boolean;
    displayMessage?: boolean;
    displayRequiredFields?: boolean;
    displayWide?: boolean;
    showAnotherWayIfPresent?: boolean;
    headerNode: ReactNode;
    showUsernameNode?: ReactNode;
    infoNode?: ReactNode;
};

export type TemplateClassKey =
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

export const defaultTemplateClasses: Record<TemplateClassKey, string | undefined> = {
    "kcHtmlClass": "login-pf",
    "kcLoginClass": "login-pf-page",
    "kcContentWrapperClass": "row",
    "kcHeaderClass": "login-pf-page-header",
    "kcHeaderWrapperClass": undefined,
    "kcFormCardClass": "card-pf",
    "kcFormCardAccountClass": "login-pf-accounts",
    "kcFormSocialAccountClass": "login-pf-social-section",
    "kcFormSocialAccountContentClass": "col-xs-12 col-sm-6",
    "kcFormHeaderClass": "login-pf-header",
    "kcLocaleWrapperClass": undefined,
    "kcFeedbackErrorIcon": "pficon pficon-error-circle-o",
    "kcFeedbackWarningIcon": "pficon pficon-warning-triangle-o",
    "kcFeedbackSuccessIcon": "pficon pficon-ok",
    "kcFeedbackInfoIcon": "pficon pficon-info",
    "kcResetFlowIcon": "pficon pficon-arrow fa-2x",
    "kcFormGroupClass": "form-group",
    "kcLabelWrapperClass": "col-xs-12 col-sm-12 col-md-12 col-lg-12",
    "kcSignUpClass": "login-pf-signup",
    "kcInfoAreaWrapperClass": undefined
};
