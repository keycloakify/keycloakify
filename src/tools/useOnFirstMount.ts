import { useEffect } from "react";
import { useConst } from "powerhooks/useConst";
import { id } from "tsafe/id";

/** Callback is guaranteed to be call only once per component mount event in strict mode */
export function useOnFistMount(callback: () => void) {
    const refHasCallbackBeenCalled = useConst(() => ({ current: id<boolean>(false) }));

    useEffect(() => {
        if (refHasCallbackBeenCalled.current) {
            return;
        }

        callback();

        refHasCallbackBeenCalled.current = true;
    }, []);
}
