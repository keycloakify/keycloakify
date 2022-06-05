export function createObjectThatThrowsIfAccessed<T extends object>(params?: { debugMessage?: string }): T {
    if (typeof Proxy === "undefined") {
        return null as any;
    }

    const { debugMessage = "" } = params ?? {};

    const get: NonNullable<ProxyHandler<T>["get"]> = (...args) => {
        const [, prop] = args;

        throw new Error(`Cannot access ${String(prop)} yet ${debugMessage}`);
    };

    return new Proxy<T>({} as any, {
        get,
        "set": get,
    });
}
