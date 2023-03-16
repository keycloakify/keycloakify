import "minimal-polyfills/Object.fromEntries";

export function allPropertiesValuesToUndefined<T extends Record<string, unknown>>(obj: T): Record<keyof T, undefined> {
    return Object.fromEntries(Object.entries(obj).map(([key]) => [key, undefined])) as any;
}
