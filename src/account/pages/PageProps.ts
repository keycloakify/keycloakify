import type { LazyExoticComponent } from "react";
import type { I18n } from "keycloakify/account/i18n";
import { type TemplateProps } from "keycloakify/account/TemplateProps";

export type PageProps<KcContext, I18nExtended extends I18n> = {
    Template: LazyExoticComponent<(props: TemplateProps<any, any>) => JSX.Element | null>;
    kcContext: KcContext;
    i18n: I18nExtended;
    doUseDefaultCss: boolean;
    classes?: Partial<Record<ClassKey, string>>;
};

export type ClassKey = "kcButtonClass" | "kcButtonPrimaryClass" | "kcButtonLargeClass" | "kcButtonDefaultClass";

export const defaultClasses: Record<ClassKey, string | undefined> = {
    /** password.ftl */
    "kcButtonClass": "btn",
    "kcButtonPrimaryClass": "btn-primary",
    "kcButtonLargeClass": "btn-lg",
    "kcButtonDefaultClass": "btn-default"
};
