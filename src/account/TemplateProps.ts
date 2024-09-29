import type { ReactNode } from "react";
import type { ClassKey } from "keycloakify/account/lib/kcClsx";

export type TemplateProps<KcContext, I18n> = {
    kcContext: KcContext;
    i18n: I18n;
    doUseDefaultCss: boolean;
    classes?: Partial<Record<ClassKey, string>>;
    children: ReactNode;

    active: string;
};

export type { ClassKey };
