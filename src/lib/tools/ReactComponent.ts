/* eslint-disable @typescript-eslint/ban-types */
import type { FC, ComponentClass } from "react";

export type ReactComponent<Props extends Record<string, unknown> = {}> =
    | ((props: Props) => ReturnType<FC>)
    | ComponentClass<Props>;
