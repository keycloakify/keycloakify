/// <reference types="react" />
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
export declare const Error: import("react").MemoExoticComponent<
    ({
        kcContext,
        ...props
    }: {
        kcContext: KcContextBase.Error;
    } & KcProps) => JSX.Element
>;
