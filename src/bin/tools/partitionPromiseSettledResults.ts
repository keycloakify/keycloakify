export type PromiseSettledAndPartitioned<T> = [T[], any[]];

export function partitionPromiseSettledResults<T>() {
    return [
        ([successes, failures]: PromiseSettledAndPartitioned<T>, item: PromiseSettledResult<T>) =>
            item.status === "rejected"
                ? ([successes, [item.reason, ...failures]] as PromiseSettledAndPartitioned<T>)
                : ([[item.value, ...successes], failures] as PromiseSettledAndPartitioned<T>),
        [[], []] as PromiseSettledAndPartitioned<T>
    ] as const;
}
