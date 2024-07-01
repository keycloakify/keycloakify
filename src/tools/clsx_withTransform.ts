import { assert } from "tsafe/assert";
import { typeGuard } from "tsafe/typeGuard";

export type CxArg<ClassName extends string = string> =
    | undefined
    | null
    | ClassName
    | boolean
    | Partial<Record<ClassName, boolean | null | undefined>>
    | readonly CxArg<ClassName>[];

export function clsx_withTransform(params: {
    args: CxArg[];
    transform: (arg: string) => string;
}): string {
    const { args, transform } = params;

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
                    toAdd = clsx_withTransform({ args: arg, transform });
                } else {
                    assert(!typeGuard<{ length: number }>(arg, false));

                    toAdd = "";
                    for (const k in arg) {
                        if (arg[k] && k) {
                            toAdd && (toAdd += " ");
                            toAdd += transform(k);
                        }
                    }
                }
                break;
            }
            default: {
                toAdd = transform(arg);
            }
        }
        if (toAdd) {
            cls && (cls += " ");
            cls += toAdd;
        }
    }
    return cls;
}
