import { useReducer, useEffect } from "react";
import { headInsert } from "keycloakify/tools/headInsert";
import { clsx } from "keycloakify/tools/clsx";
import { assert } from "tsafe/assert";

export function usePrepareTemplate(params: {
    styles: string[];
    scripts: {
        isModule: boolean;
        source:
            | {
                  type: "url";
                  src: string;
              }
            | {
                  type: "inline";
                  code: string;
              };
    }[];
    htmlClassName: string | undefined;
    bodyClassName: string | undefined;
    htmlLangProperty: string | undefined;
    documentTitle: string | undefined;
}) {
    const { styles, scripts, htmlClassName, bodyClassName, htmlLangProperty, documentTitle } = params;

    const [isReady, setReady] = useReducer(() => true, styles.length === 0 && scripts.length === 0);

    useEffect(() => {
        if (htmlLangProperty === undefined) {
            return;
        }

        const html = document.querySelector("html");
        assert(html !== null);
        html.lang = htmlLangProperty;
    }, [htmlLangProperty]);

    useEffect(() => {
        if (documentTitle === undefined) {
            return;
        }

        document.title = documentTitle;
    }, [documentTitle]);

    useEffect(() => {
        let isUnmounted = false;

        const removeArray: (() => void)[] = [];

        (async () => {
            for (const style of [...styles].reverse()) {
                const { prLoaded, remove } = headInsert({
                    "type": "css",
                    "position": "prepend",
                    "href": style
                });

                removeArray.push(remove);

                // TODO: Find a way to do that in parallel (without breaking the order)
                await prLoaded;

                if (isUnmounted) {
                    return;
                }
            }

            setReady();
        })();

        scripts.forEach(script => {
            const { remove } = headInsert({
                "type": "javascript",
                ...script
            });

            removeArray.push(remove);
        });

        return () => {
            isUnmounted = true;
            removeArray.forEach(remove => remove());
        };
    }, []);

    useSetClassName({
        "target": "html",
        "className": htmlClassName
    });

    useSetClassName({
        "target": "body",
        "className": bodyClassName
    });

    return { isReady };
}

function useSetClassName(params: { target: "html" | "body"; className: string | undefined }) {
    const { target, className } = params;

    useEffect(() => {
        if (className === undefined) {
            return;
        }

        const htmlClassList = document.getElementsByTagName(target)[0].classList;

        const tokens = clsx(className).split(" ");

        htmlClassList.add(...tokens);

        return () => {
            htmlClassList.remove(...tokens);
        };
    }, [className]);
}
