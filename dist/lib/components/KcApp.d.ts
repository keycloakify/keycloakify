/// <reference types="react" />
import type { KcContextBase } from "../getKcContext/KcContextBase";
import type { KcProps } from "./KcProps";
export declare const KcApp: import("react").MemoExoticComponent<({ kcContext, ...props }: {
    kcContext: KcContextBase;
} & KcProps) => JSX.Element | null>;
