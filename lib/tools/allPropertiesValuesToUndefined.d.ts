import "minimal-polyfills/Object.fromEntries";
export declare function allPropertiesValuesToUndefined<T extends Record<string, unknown>>(obj: T): Record<keyof T, undefined>;
