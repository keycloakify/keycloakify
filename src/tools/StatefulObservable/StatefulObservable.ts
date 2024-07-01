import { assert } from "tsafe/assert";
import { is } from "tsafe/is";

export type StatefulObservable<T> = {
    current: T;
    subscribe: (next: (data: T) => void) => Subscription;
};

export type Subscription = {
    unsubscribe(): void;
};

export function createStatefulObservable<T>(
    getInitialValue: () => T
): StatefulObservable<T> {
    const nextFunctions: ((data: T) => void)[] = [];

    const { get, set } = (() => {
        let wrappedState: [T] | undefined = undefined;

        function set(data: T) {
            wrappedState = [data];

            nextFunctions.forEach(next => next(data));
        }

        return {
            get: () => {
                if (wrappedState === undefined) {
                    set(getInitialValue());
                    assert(!is<undefined>(wrappedState));
                }
                return wrappedState[0];
            },
            set
        };
    })();

    return Object.defineProperty(
        {
            current: null as any as T,
            subscribe: (next: (data: T) => void) => {
                nextFunctions.push(next);

                return {
                    unsubscribe: () =>
                        nextFunctions.splice(nextFunctions.indexOf(next), 1)
                };
            }
        },
        "current",
        {
            enumerable: true,
            get,
            set
        }
    );
}
