type SimpleType = number | string | boolean | null | undefined;
type FuncWithSimpleParams<T extends SimpleType[], R> = (...args: T) => R;

export function memoize<T extends SimpleType[], R>(
    fn: FuncWithSimpleParams<T, R>,
    options?: {
        argsLength?: number;
        max?: number;
    }
): FuncWithSimpleParams<T, R> {
    const cache = new Map<string, ReturnType<FuncWithSimpleParams<T, R>>>();

    const { argsLength = fn.length, max = Infinity } = options ?? {};

    return ((...args: Parameters<FuncWithSimpleParams<T, R>>) => {
        const key = JSON.stringify(
            args
                .slice(0, argsLength)
                .map(v => {
                    if (v === null) {
                        return "null";
                    }
                    if (v === undefined) {
                        return "undefined";
                    }
                    switch (typeof v) {
                        case "number":
                            return `number-${v}`;
                        case "string":
                            return `string-${v}`;
                        case "boolean":
                            return `boolean-${v ? "true" : "false"}`;
                    }
                })
                .join("-sIs9sAslOdeWlEdIos3-")
        );

        if (cache.has(key)) {
            return cache.get(key);
        }

        if (max === cache.size) {
            for (const key of cache.keys()) {
                cache.delete(key);
                break;
            }
        }

        const value = fn(...args);

        cache.set(key, value);

        return value;
    }) as any;
}
