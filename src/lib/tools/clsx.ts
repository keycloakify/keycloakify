import { assert } from "tsafe/assert";
import { typeGuard } from "tsafe/typeGuard";

export type CxArg = undefined | null | string | boolean | Partial<Record<string, boolean | null | undefined>> | readonly CxArg[];

export const clsx = (...args: CxArg[]): string => {
    const len = args.length;
    let i = 0;
    let cls = "";
    for (; i < len; i++) {
        const arg = args[i];
        if (arg == null) continue;

        let toAdd;
        switch (typeof arg) {
            case "boolean":
                break;
            case "object": {
                if (Array.isArray(arg)) {
                    toAdd = clsx(arg);
                } else {
                    assert(!typeGuard<{ length: number }>(arg, false));

                    toAdd = "";
                    for (const k in arg) {
                        if (arg[k as string] && k) {
                            toAdd && (toAdd += " ");
                            toAdd += k;
                        }
                    }
                }
                break;
            }
            default: {
                toAdd = arg;
            }
        }
        if (toAdd) {
            cls && (cls += " ");
            cls += toAdd;
        }
    }
    return cls;
};
