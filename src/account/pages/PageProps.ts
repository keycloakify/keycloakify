import type { TemplateProps, ClassKey } from "keycloakify/account/TemplateProps";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import type { I18n } from "../i18n";
import type { KcContext } from "../kcContext";

export type PageProps<NarrowedKcContext = KcContext, I18nExtended extends I18n = I18n> = {
    Template: LazyOrNot<(props: TemplateProps<any, any>) => JSX.Element | null>;
    kcContext: NarrowedKcContext;
    i18n: I18nExtended;
    doUseDefaultCss: boolean;
    classes?: Partial<Record<ClassKey, string>>;
};
