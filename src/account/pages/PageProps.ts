import type { TemplateProps, ClassKey } from "keycloakify/account/TemplateProps";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import type { KcContext } from "../KcContext";

export type PageProps<NarrowedKcContext = KcContext> = {
    Template: LazyOrNot<(props: TemplateProps<any>) => JSX.Element | null>;
    kcContext: NarrowedKcContext;
    doUseDefaultCss: boolean;
    classes?: Partial<Record<ClassKey, string>>;
};
