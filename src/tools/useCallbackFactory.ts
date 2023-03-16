import { useRef, useState } from "react";
import { id } from "tsafe/id";
import { memoize } from "./memoize";

export type CallbackFactory<FactoryArgs extends unknown[], Args extends unknown[], R> = (...factoryArgs: FactoryArgs) => (...args: Args) => R;

/**
 * https://docs.powerhooks.dev/api-reference/usecallbackfactory
 *
 *  const callbackFactory= useCallbackFactory(
 *      ([key]: [string], [params]: [{ foo: number; }]) => {
 *          ...
 *      },
 *      []
 *  );
 *
 * WARNING: Factory args should not be of variable length.
 *
 */
export function useCallbackFactory<FactoryArgs extends (string | number | boolean)[], Args extends unknown[], R = void>(
    callback: (...callbackArgs: [FactoryArgs, Args]) => R
): CallbackFactory<FactoryArgs, Args, R> {
    type Out = CallbackFactory<FactoryArgs, Args, R>;

    const callbackRef = useRef<typeof callback>(callback);

    callbackRef.current = callback;

    const memoizedRef = useRef<Out | undefined>(undefined);

    return useState(() =>
        id<Out>((...factoryArgs) => {
            if (memoizedRef.current === undefined) {
                memoizedRef.current = memoize(
                    (...factoryArgs: FactoryArgs) =>
                        (...args: Args) =>
                            callbackRef.current(factoryArgs, args),
                    { "argsLength": factoryArgs.length }
                );
            }

            return memoizedRef.current(...factoryArgs);
        })
    )[0];
}
