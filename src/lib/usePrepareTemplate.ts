import { useReducer, useEffect } from "react";
import { clsx } from "keycloakify/tools/clsx";
import { assert } from "tsafe/assert";
import { useInsertScriptTags, type ScriptTag } from "keycloakify/tools/useInsertScriptTags";

export function usePrepareTemplate(params: {
    styleSheetHrefs: string[];
    scriptTags: ScriptTag[];
    htmlClassName: string | undefined;
    bodyClassName: string | undefined;
    htmlLangProperty: string | undefined;
    documentTitle: string | undefined;
}) {
    const { styleSheetHrefs, scriptTags, htmlClassName, bodyClassName, htmlLangProperty, documentTitle } = params;

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

    const { areAllStyleSheetsLoaded } = useInsertLinkTags({ "hrefs": styleSheetHrefs });

    // NOTE: We want to load the script after the page have been fully rendered.
    useInsertScriptTags({ "scriptTags": !areAllStyleSheetsLoaded ? [] : scriptTags });

    useSetClassName({
        "target": "html",
        "className": htmlClassName
    });

    useSetClassName({
        "target": "body",
        "className": bodyClassName
    });

    return { areAllStyleSheetsLoaded };
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

const hrefByPrLoaded = new Map<string, Promise<void>>();

/** NOTE: The hrefs can't changes. There should be only one one call on this. */
function useInsertLinkTags(params: { hrefs: string[] }) {
    const { hrefs } = params;

    const [areAllStyleSheetsLoaded, setAllStyleSheetLoaded] = useReducer(() => true, hrefs.length === 0);

    useEffect(() => {
        let isActive = true;

        let lastMountedHtmlElement: HTMLLinkElement | undefined = undefined;

        for (const href of hrefs) {
            if (hrefByPrLoaded.has(href)) {
                continue;
            }

            const htmlElement = document.createElement("link");

            hrefByPrLoaded.set(href, new Promise<void>(resolve => htmlElement.addEventListener("load", () => resolve())));

            htmlElement.rel = "stylesheet";

            htmlElement.href = href;

            if (lastMountedHtmlElement !== undefined) {
                lastMountedHtmlElement.insertAdjacentElement("afterend", htmlElement);
            } else {
                document.head.prepend(htmlElement);
            }

            lastMountedHtmlElement = htmlElement;
        }

        Promise.all(Array.from(hrefByPrLoaded.values())).then(() => {
            if (!isActive) {
                return;
            }
            setAllStyleSheetLoaded();
        });

        return () => {
            isActive = false;
        };
    }, []);

    return { areAllStyleSheetsLoaded };
}
