import { useRef, useState } from "react";
import { Parameters } from "tsafe/Parameters";

/** https://stackoverflow.com/questions/65890278/why-cant-usecallback-always-return-the-same-ref */
export function useConstCallback<T extends ((...args: any[]) => unknown) | undefined | null>(callback: NonNullable<T>): T {
    const callbackRef = useRef<typeof callback>(null as any);

    callbackRef.current = callback;

    return useState(
        () =>
            (...args: Parameters<T>) =>
                callbackRef.current(...args)
    )[0] as T;
}
