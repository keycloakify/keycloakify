import { type TemplateProps, type ClassKey } from "keycloakify/login/TemplateProps";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import type { KcContext } from "keycloakify/account/KcContext";

export type PageProps<NarowedKcContext = KcContext> = {
    Template: LazyOrNot<(props: TemplateProps<any>) => JSX.Element | null>;
    kcContext: NarowedKcContext;
    doUseDefaultCss: boolean;
    classes?: Partial<Record<ClassKey, string>>;
};
