import type { ReactNode } from "react";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import type { KcTemplateProps } from "./KcProps";
export declare type TemplateProps = {
    displayInfo?: boolean;
    displayMessage?: boolean;
    displayRequiredFields?: boolean;
    displayWide?: boolean;
    showAnotherWayIfPresent?: boolean;
    headerNode: ReactNode;
    showUsernameNode?: ReactNode;
    formNode: ReactNode;
    infoNode?: ReactNode;
    /** If you write your own page you probably want
     * to avoid pulling the default theme assets.
     */
    doFetchDefaultThemeResources: boolean;
} & {
    kcContext: KcContextBase;
} & KcTemplateProps;
export declare const Template: import("react").MemoExoticComponent<(props: TemplateProps) => JSX.Element | null>;
