import { useReducer, useEffect } from "react";

export function createUseInsertLinkTags() {
    let linkTagsContext:
        | {
              styleSheetHrefs: string[];
              prAreAllStyleSheetsLoaded: Promise<void>;
              remove: () => void;
          }
        | undefined = undefined;

    /** NOTE: The hrefs can't changes. There should be only one one call on this. */
    function useInsertLinkTags(params: { hrefs: string[] }) {
        const { hrefs } = params;

        const [areAllStyleSheetsLoaded, setAllStyleSheetLoaded] = useReducer(() => true, hrefs.length === 0);

        useEffect(() => {
            let isActive = true;

            mount_link_tags: {
                if (linkTagsContext !== undefined) {
                    if (JSON.stringify(linkTagsContext.styleSheetHrefs) === JSON.stringify(hrefs)) {
                        break mount_link_tags;
                    }

                    linkTagsContext.remove();

                    linkTagsContext = undefined;
                }

                let lastMountedHtmlElement: HTMLLinkElement | undefined = undefined;

                const prs: Promise<void>[] = [];
                const removeFns: (() => void)[] = [];

                for (const href of hrefs) {
                    const htmlElement = document.createElement("link");

                    prs.push(new Promise<void>(resolve => htmlElement.addEventListener("load", () => resolve())));

                    htmlElement.rel = "stylesheet";

                    htmlElement.href = href;

                    if (lastMountedHtmlElement !== undefined) {
                        lastMountedHtmlElement.insertAdjacentElement("afterend", htmlElement);
                    } else {
                        document.head.prepend(htmlElement);
                    }

                    removeFns.push(() => {
                        htmlElement.remove();
                    });

                    lastMountedHtmlElement = htmlElement;
                }

                linkTagsContext = {
                    "styleSheetHrefs": hrefs,
                    "prAreAllStyleSheetsLoaded": Promise.all(prs).then(() => undefined),
                    "remove": () => removeFns.forEach(fn => fn())
                };
            }

            linkTagsContext.prAreAllStyleSheetsLoaded.then(() => {
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

    return { useInsertLinkTags };
}
