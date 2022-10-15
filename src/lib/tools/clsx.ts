import { classnames } from "tss-react/tools/classnames";
import type { Cx } from "tss-react";

/** Drop in replacement for https://www.npmjs.com/package/clsx */
export const clsx: Cx = (...args) => {
    return classnames(args);
};
