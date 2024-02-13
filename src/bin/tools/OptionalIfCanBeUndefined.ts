type PropertiesThatCanBeUndefined<T extends Record<string, unknown>> = {
    [Key in keyof T]: undefined extends T[Key] ? Key : never;
}[keyof T];

/**
 * 	OptionalIfCanBeUndefined<{ p1: string | undefined; p2: string; }>
 *  is
 * 	{ p1?: string | undefined; p2: string }
 */
export type OptionalIfCanBeUndefined<T extends Record<string, unknown>> = {
    [K in PropertiesThatCanBeUndefined<T>]?: T[K];
} & { [K in Exclude<keyof T, PropertiesThatCanBeUndefined<T>>]: T[K] };
