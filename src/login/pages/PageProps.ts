import type { JSX } from "keycloakify/tools/JSX";
import { type TemplateProps, type ClassKey } from "keycloakify/login/TemplateProps";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";

export type PageProps<NarrowedKcContext, I18n> = {
    Template: LazyOrNot<(props: TemplateProps<any, any>) => JSX.Element | null>;
    kcContext: NarrowedKcContext;
    i18n: I18n;
    doUseDefaultCss: boolean;
    classes?: Partial<Record<ClassKey, string>>;
};
