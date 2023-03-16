import { useState } from "react";

/**
 * Compute a value on first render and never again,
 * Equivalent of const [x] = useState(()=> ...)
 */
export function useConst<T>(getValue: () => T): T {
    const [value] = useState(getValue);
    return value;
}
