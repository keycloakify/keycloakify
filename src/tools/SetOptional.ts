export type SetOptional<T extends Record<string, unknown>, K extends keyof T> = Omit<T, K> & Partial<Record<K, T[K]>>;
