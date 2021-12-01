/// <reference types="react" />
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
export declare const Info: import("react").MemoExoticComponent<
    ({
        kcContext,
        ...props
    }: {
        kcContext: KcContextBase.Info;
    } & KcProps) => JSX.Element
>;
