import { useObservable } from "./useObservable";
import { useState } from "react";
import type { StatefulObservable } from "../StatefulObservable";

/**
 * Equivalent of https://docs.evt.land/api/react-hooks
 * */
export function useRerenderOnChange($: StatefulObservable<unknown>): void {
    //NOTE: We use function in case the state is a function
    const [, setCurrent] = useState(() => $.current);

    useObservable(
        ({ registerSubscription }) => {
            const subscription = $.subscribe(current => setCurrent(() => current));
            registerSubscription(subscription);
        },
        [$]
    );
}
