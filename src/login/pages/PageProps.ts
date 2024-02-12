import type { I18n } from "keycloakify/login/i18n";
import { type TemplateProps, type ClassKey } from "keycloakify/login/TemplateProps";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import type { KcContext } from "keycloakify/account/kcContext";

export type PageProps<NarowedKcContext = KcContext, I18nExtended extends I18n = I18n> = {
    Template: LazyOrNot<(props: TemplateProps<any, any>) => JSX.Element | null>;
    kcContext: NarowedKcContext;
    i18n: I18nExtended;
    doUseDefaultCss: boolean;
    classes?: Partial<Record<ClassKey, string>>;
};
