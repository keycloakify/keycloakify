import type { ReactNode } from "react";
import type { KcContext } from "./KcContext";

export type TemplateProps<KcContext extends KcContext.Common> = {
    kcContext: KcContext;
    doUseDefaultCss: boolean;
    active: string;
    classes?: Partial<Record<ClassKey, string>>;
    children: ReactNode;
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
