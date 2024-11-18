import { assert, is } from "tsafe/assert";
import { structuredCloneButFunctions } from "./structuredCloneButFunctions";

/** NOTE: Array a copied over, not merged. */
export function deepAssign(params: {
    target: Record<string, unknown>;
    source: Record<string, unknown>;
}): void {
    const { target, source } = params;

    Object.keys(source).forEach(key => {
        var dereferencedSource = source[key];

        if (dereferencedSource === undefined) {
            delete target[key];
            return;
        }

        if (dereferencedSource instanceof Date) {
            assign({
                target,
                key,
                value: new Date(dereferencedSource.getTime())
            });

            return;
        }

        if (dereferencedSource instanceof Array) {
            assign({
                target,
                key,
                value: structuredCloneButFunctions(dereferencedSource)
            });

            return;
        }

        if (
            dereferencedSource instanceof Function ||
            !(dereferencedSource instanceof Object)
        ) {
            assign({
                target,
                key,
                value: dereferencedSource
            });

            return;
        }

        if (!(target[key] instanceof Object)) {
            target[key] = {};
        }

        const dereferencedTarget = target[key];

        assert(is<Record<string, unknown>>(dereferencedTarget));
        assert(is<Record<string, unknown>>(dereferencedSource));

        deepAssign({
            target: dereferencedTarget,
            source: dereferencedSource
        });
    });
}

function assign(params: {
    target: Record<string, unknown>;
    key: string;
    value: unknown;
}): void {
    const { target, key, value } = params;

    Object.defineProperty(target, key, {
        enumerable: true,
        writable: true,
        configurable: true,
        value
    });
}
