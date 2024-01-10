import type { I18n } from "keycloakify/login/i18n";
import { type TemplateProps, type ClassKey } from "keycloakify/login/TemplateProps";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";

export type PageProps<KcContext, I18nExtended extends I18n> = {
    Template: LazyOrNot<(props: TemplateProps<any, any>) => JSX.Element | null>;
    kcContext: KcContext;
    i18n: I18nExtended;
    doUseDefaultCss: boolean;
    classes?: Partial<Record<ClassKey, string>>;
};
