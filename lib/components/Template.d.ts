import type { ReactNode } from "react";
import type { KcTemplateProperties } from "./KcProperties";
export declare type TemplateProps = {
    kcProperties: KcTemplateProperties;
    displayInfo?: boolean;
    displayMessage?: boolean;
    displayRequiredFields?: boolean;
    displayWide?: boolean;
    showAnotherWayIfPresent?: boolean;
    headerNode: ReactNode;
    showUsernameNode?: ReactNode;
    formNode: ReactNode;
    displayInfoNode?: ReactNode;
};
export declare const Template: import("react").MemoExoticComponent<(props: TemplateProps) => JSX.Element | null>;
