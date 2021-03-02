import type { ReactNode } from "react";
declare type KcClasses<T extends string> = {
    [key in T]?: string[] | string;
};
export declare type KcProperties = {
    stylesCommon?: string[];
    styles?: string[];
    scripts?: string[];
} & KcClasses<"kcLoginClass" | "kcHeaderClass" | "kcHeaderWrapperClass" | "kcFormCardClass" | "kcFormCardAccountClass" | "kcFormHeaderClass" | "kcLocaleWrapperClass" | "kcContentWrapperClass" | "kcLabelWrapperClass" | "kcContentWrapperClass" | "kcLabelWrapperClass" | "kcFormGroupClass" | "kcResetFlowIcon" | "kcResetFlowIcon" | "kcFeedbackSuccessIcon" | "kcFeedbackWarningIcon" | "kcFeedbackErrorIcon" | "kcFeedbackInfoIcon" | "kcContentWrapperClass" | "kcFormSocialAccountContentClass" | "kcFormSocialAccountClass" | "kcSignUpClass" | "kcInfoAreaWrapperClass">;
export declare type Props = {
    displayInfo?: boolean;
    displayMessage: boolean;
    displayRequiredFields: boolean;
    displayWide: boolean;
    showAnotherWayIfPresent: boolean;
    properties?: KcProperties;
    headerNode: ReactNode;
    showUsernameNode: ReactNode;
    formNode: ReactNode;
    displayInfoNode: ReactNode;
};
export declare function Template(props: Props): JSX.Element;
export {};
