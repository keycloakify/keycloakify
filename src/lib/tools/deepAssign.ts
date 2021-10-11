import { assert } from "tsafe/assert";
import { is } from "tsafe/is";

//Warning: Be mindful that because of array this is not idempotent.
export function deepAssign(params: { target: Record<string, unknown>; source: Record<string, unknown> }) {
    const { target, source } = params;

    Object.keys(source).forEach(key => {
        var dereferencedSource = source[key];

        if (target[key] === undefined || !(dereferencedSource instanceof Object)) {
            Object.defineProperty(target, key, {
                "enumerable": true,
                "writable": true,
                "configurable": true,
                "value": dereferencedSource,
            });

            return;
        }

        const dereferencedTarget = target[key];

        if (dereferencedSource instanceof Array) {
            assert(is<unknown[]>(dereferencedTarget));
            assert(is<unknown[]>(dereferencedSource));

            dereferencedSource.forEach(entry => dereferencedTarget.push(entry));

            return;
        }

        assert(is<Record<string, unknown>>(dereferencedTarget));
        assert(is<Record<string, unknown>>(dereferencedSource));

        deepAssign({
            "target": dereferencedTarget,
            "source": dereferencedSource,
        });
    });
}
