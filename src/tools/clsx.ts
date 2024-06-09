import { id } from "tsafe";
import { clsx_withTransform, type CxArg as CxArg_generic } from "./clsx_withTransform";

export type CxArg = CxArg_generic<string>;

export function clsx(...args: CxArg[]): string {
    return clsx_withTransform({ args, transform: id });
}
