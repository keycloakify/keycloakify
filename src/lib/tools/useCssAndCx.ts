import { clsx as cx } from "./clsx";

/**
 * @deprecated: Use clsx instead.
 * import { clsx } from "keycloakify/lib/tools/clsx";
 * You can use clsx as cx.
 * If you where using the css() function you can import
 * it from @emotion/css: https://emotion.sh/docs/@emotion/css
 */
export function useCssAndCx() {
    return { cx };
}
