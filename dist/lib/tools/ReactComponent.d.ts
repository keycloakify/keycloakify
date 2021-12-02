import type { FC, ComponentClass } from "react";
export declare type ReactComponent<Props extends Record<string, unknown> = {}> = ((props: Props) => ReturnType<FC>) | ComponentClass<Props>;
