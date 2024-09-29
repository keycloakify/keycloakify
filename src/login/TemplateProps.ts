import type { ReactNode } from "react";
import type { ClassKey } from "keycloakify/login/lib/kcClsx";

export type TemplateProps<KcContext, I18n> = {
    kcContext: KcContext;
    i18n: I18n;
    doUseDefaultCss: boolean;
    classes?: Partial<Record<ClassKey, string>>;
    children: ReactNode;

    displayInfo?: boolean;
    displayMessage?: boolean;
    displayRequiredFields?: boolean;
    showAnotherWayIfPresent?: boolean;
    headerNode: ReactNode;
    socialProvidersNode?: ReactNode;
    infoNode?: ReactNode;
    documentTitle?: string;
    bodyClassName?: string;
};

export type { ClassKey };
