import type { LazyExoticComponent } from "react";
import type { I18n } from "keycloakify/account/i18n";
import type { TemplateProps, ClassKey } from "keycloakify/account/TemplateProps";

export type PageProps<KcContext, I18nExtended extends I18n> = {
    Template: LazyExoticComponent<(props: TemplateProps<any, any>) => JSX.Element | null>;
    kcContext: KcContext;
    i18n: I18nExtended;
    doUseDefaultCss: boolean;
    classes?: Partial<Record<ClassKey, string>>;
};
