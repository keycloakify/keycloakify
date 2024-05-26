import { useEffect } from "react";
import type { Subscription } from "../StatefulObservable";

/**
 * Equivalent of https://docs.evt.land/api/react-hooks
 */
export function useObservable(
    effect: (params: {
        registerSubscription: (subscription: Subscription) => void;
    }) => void,
    deps: React.DependencyList
): void {
    useEffect(() => {
        const subscriptions: Subscription[] = [];

        effect({
            registerSubscription: subscription => subscriptions.push(subscription)
        });

        return () => {
            subscriptions.forEach(subscription => subscription.unsubscribe());
            subscriptions.length = 0;
        };
    }, deps);
}
