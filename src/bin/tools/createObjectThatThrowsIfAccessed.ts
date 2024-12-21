const keyIsTrapped = "isTrapped_zSskDe9d";

export class AccessError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export function createObjectThatThrowsIfAccessed<T extends object>(params?: {
    debugMessage?: string;
    isPropertyWhitelisted?: (prop: string | number | symbol) => boolean;
}): T {
    const { debugMessage = "", isPropertyWhitelisted = () => false } = params ?? {};

    const get: NonNullable<ProxyHandler<T>["get"]> = (...args) => {
        const [, prop] = args;

        if (isPropertyWhitelisted(prop)) {
            return Reflect.get(...args);
        }

        if (prop === keyIsTrapped) {
            return true;
        }

        throw new AccessError(`Cannot access ${String(prop)} yet ${debugMessage}`);
    };

    const trappedObject = new Proxy<T>({} as any, {
        get,
        set: get
    });

    return trappedObject;
}

export function createObjectThatThrowsIfAccessedFactory(params: {
    isPropertyWhitelisted?: (prop: string | number | symbol) => boolean;
}) {
    const { isPropertyWhitelisted } = params;

    return {
        createObjectThatThrowsIfAccessed: <T extends object>(params?: {
            debugMessage?: string;
        }) => {
            const { debugMessage } = params ?? {};

            return createObjectThatThrowsIfAccessed<T>({
                debugMessage,
                isPropertyWhitelisted
            });
        }
    };
}

export function isObjectThatThrowIfAccessed(obj: object) {
    return (obj as any)[keyIsTrapped] === true;
}

export const THROW_IF_ACCESSED = {
    __brand: "THROW_IF_ACCESSED"
};

export function createObjectWithSomePropertiesThatThrowIfAccessed<
    T extends Record<string, unknown>
>(obj: { [K in keyof T]: T[K] | typeof THROW_IF_ACCESSED }, debugMessage?: string): T {
    return Object.defineProperties(
        obj,
        Object.fromEntries(
            Object.entries(obj)
                .filter(([, value]) => value === THROW_IF_ACCESSED)
                .map(([key]) => {
                    const getAndSet = () => {
                        throw new AccessError(
                            `Cannot access ${key} yet ${debugMessage ?? ""}`
                        );
                    };

                    const pd = {
                        get: getAndSet,
                        set: getAndSet,
                        enumerable: true
                    };

                    return [key, pd];
                })
        )
    ) as any;
}
