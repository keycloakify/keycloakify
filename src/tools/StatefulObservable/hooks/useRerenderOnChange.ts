import { useObservable } from "./useObservable";
import { useState } from "react";
import type { StatefulObservable } from "../StatefulObservable";

/**
 * Equivalent of https://docs.evt.land/api/react-hooks
 * */
export function useRerenderOnChange(obs: StatefulObservable<unknown>): void {
    //NOTE: We use function in case the state is a function
    const [, setCurrent] = useState(() => obs.current);

    useObservable(
        ({ registerSubscription }) => {
            const subscription = obs.subscribe(current => setCurrent(() => current));
            registerSubscription(subscription);
        },
        [obs]
    );
}
