import type { ReactNode } from "react";
import type { KcContext } from "./kcContext";
import type { I18n } from "./i18n";

export type TemplateProps<KcContext extends KcContext.Common, I18nExtended extends I18n> = {
    kcContext: KcContext;
    i18n: I18nExtended;
    doUseDefaultCss: boolean;
    active: string;
    bodyClass: string | undefined;
    children: ReactNode;
};
