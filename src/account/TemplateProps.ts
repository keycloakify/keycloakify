import type { ReactNode } from "react";

export type TemplateProps<KcContext, I18n> = {
    kcContext: KcContext;
    i18n: I18n;
    doUseDefaultCss: boolean;
    classes?: Partial<Record<ClassKey, string>>;
    children: ReactNode;

    active: string;
};

export type ClassKey =
    | "kcHtmlClass"
    | "kcBodyClass"
    | "kcButtonClass"
    | "kcButtonPrimaryClass"
    | "kcButtonLargeClass"
    | "kcButtonDefaultClass"
    | "kcContentWrapperClass"
    | "kcFormClass"
    | "kcFormGroupClass"
    | "kcInputWrapperClass"
    | "kcLabelClass"
    | "kcInputClass"
    | "kcInputErrorMessageClass";
