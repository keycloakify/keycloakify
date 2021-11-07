import { assert } from "tsafe/assert";
import { is } from "tsafe/is";

function deepClone<T>(src: T): T {
    const generateId = (() => {
        const prefix = "xIfKdLsIIdJdLdOeJqePe";

        let counter = 0;

        return () => `${prefix}${counter++}`;
    })();

    const map = new Map<string, Function>();

    return JSON.parse(
        JSON.stringify(src, (...[, value]) => {
            if (typeof value === "function") {
                const id = generateId();

                map.set(id, value);

                return id;
            }

            return value;
        }),
        (...[, value]) => (typeof value === "string" && map.has(value) ? map.get(value) : value),
    );
}

//Warning: Be mindful that because of array this is not idempotent.
export function deepAssign(params: { target: Record<string, unknown>; source: Record<string, unknown> }) {
    const { target } = params;

    const source = deepClone(params.source);

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
