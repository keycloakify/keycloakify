import type { I18n } from "keycloakify/account/i18n";
import type { TemplateProps, ClassKey } from "keycloakify/account/TemplateProps";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";

export type PageProps<KcContext, I18nExtended extends I18n> = {
    Template: LazyOrNot<(props: TemplateProps<any, any>) => JSX.Element | null>;
    kcContext: KcContext;
    i18n: I18nExtended;
    doUseDefaultCss: boolean;
    classes?: Partial<Record<ClassKey, string>>;
};
