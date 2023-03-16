import "minimal-polyfills/Object.fromEntries";

export function deepClone<T>(o: T): T {
    if (!(o instanceof Object)) {
        return o;
    }

    if (typeof o === "function") {
        return o;
    }

    if (o instanceof Array) {
        return o.map(deepClone) as any;
    }

    return Object.fromEntries(Object.entries(o).map(([key, value]) => [key, deepClone(value)])) as any;
}
