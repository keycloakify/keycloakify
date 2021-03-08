import type { ReactNode } from "react";
import type { KcContext } from "../KcContext";
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
} & {
    kcContext: KcContext.Template;
} & KcTemplateProps;
export declare const Template: import("react").MemoExoticComponent<(props: TemplateProps) => JSX.Element | null>;
