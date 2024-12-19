import { getIsAtomic, getValueAtPath, type Stringifyable } from "./Stringifyable";

export function canonicalStringify(params: {
    data: Record<string, Stringifyable> | Stringifyable[];
    referenceData: Record<string, Stringifyable> | Stringifyable[];
}): string {
    const { data, referenceData } = params;

    return JSON.stringify(
        makeDeterministicCopy({
            path: [],
            data,
            getCanonicalKeys: path => {
                const referenceValue = (() => {
                    const path_patched: (string | number)[] = [];

                    for (let i = 0; i < path.length; i++) {
                        let value_i = getValueAtPath(referenceData, [
                            ...path_patched,
                            path[i]
                        ]);

                        if (value_i !== undefined) {
                            path_patched.push(path[i]);
                            continue;
                        }

                        if (typeof path[i] !== "number") {
                            return undefined;
                        }

                        value_i = getValueAtPath(referenceData, [...path_patched, 0]);

                        if (value_i !== undefined) {
                            path_patched.push(0);
                            continue;
                        }

                        return undefined;
                    }

                    return getValueAtPath(referenceData, path_patched);
                })();

                if (referenceValue === undefined) {
                    return undefined;
                }

                if (getIsAtomic(referenceValue)) {
                    return undefined;
                }

                if (referenceValue instanceof Array) {
                    return undefined;
                }

                return Object.keys(referenceValue);
            }
        }),
        null,
        2
    );
}

function makeDeterministicCopy(params: {
    path: (string | number)[];
    data: Stringifyable;
    getCanonicalKeys: (path: (string | number)[]) => string[] | undefined;
}): Stringifyable {
    const { path, data, getCanonicalKeys } = params;

    if (getIsAtomic(data)) {
        return data;
    }

    if (data instanceof Array) {
        return makeDeterministicCopy_array({
            path,
            data,
            getCanonicalKeys
        });
    }

    return makeDeterministicCopy_record({
        path,
        data,
        getCanonicalKeys
    });
}

function makeDeterministicCopy_record(params: {
    path: (string | number)[];
    data: Record<string, Stringifyable>;
    getCanonicalKeys: (path: (string | number)[]) => string[] | undefined;
}): Record<string, Stringifyable> {
    const { path, data, getCanonicalKeys } = params;

    const keysOfAtomicValues: string[] = [];
    const keysOfNonAtomicValues: string[] = [];

    for (const [key, value] of Object.entries(data)) {
        if (getIsAtomic(value)) {
            keysOfAtomicValues.push(key);
        } else {
            keysOfNonAtomicValues.push(key);
        }
    }

    keysOfAtomicValues.sort();
    keysOfNonAtomicValues.sort();

    const keys = [...keysOfAtomicValues, ...keysOfNonAtomicValues];

    reorder_according_to_canonical: {
        const canonicalKeys = getCanonicalKeys(path);

        if (canonicalKeys === undefined) {
            break reorder_according_to_canonical;
        }

        const keys_toPrepend: string[] = [];

        for (const key of canonicalKeys) {
            const indexOfKey = keys.indexOf(key);

            if (indexOfKey === -1) {
                continue;
            }

            keys.splice(indexOfKey, 1);
            keys_toPrepend.push(key);
        }

        keys.unshift(...keys_toPrepend);
    }

    const result: Record<string, Stringifyable> = {};

    for (const key of keys) {
        result[key] = makeDeterministicCopy({
            path: [...path, key],
            data: data[key],
            getCanonicalKeys
        });
    }

    return result;
}

function makeDeterministicCopy_array(params: {
    path: (string | number)[];
    data: Stringifyable[];
    getCanonicalKeys: (path: (string | number)[]) => string[] | undefined;
}): Stringifyable[] {
    const { path, data, getCanonicalKeys } = params;

    return [...data].map((entry, i) =>
        makeDeterministicCopy({
            path: [...path, i],
            data: entry,
            getCanonicalKeys
        })
    );
}
