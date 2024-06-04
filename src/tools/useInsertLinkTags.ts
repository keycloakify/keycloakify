import { useEffect, useState } from "react";
import {
    createStatefulObservable,
    useRerenderOnChange
} from "keycloakify/tools/StatefulObservable";

/**
 * NOTE: The component that use this hook can only be mounded once!
 * And can't rerender with different hrefs.
 * If it's mounted again the page will be reloaded.
 * This simulates the behavior of a server rendered page that imports css stylesheet in the head.
 */
export function createUseInsertLinkTags() {
    let isFistMount = true;

    const obsAreAllStyleSheetsLoaded = createStatefulObservable(() => false);

    function useInsertLinkTags(params: { hrefs: string[] }) {
        const { hrefs } = params;

        useRerenderOnChange(obsAreAllStyleSheetsLoaded);

        useState(() => {
            if (!isFistMount) {
                window.location.reload();
                return;
            }

            isFistMount = false;
        });

        useEffect(() => {
            let isActive = true;

            let lastMountedHtmlElement: HTMLLinkElement | undefined = undefined;

            const prs: Promise<void>[] = [];

            for (const href of hrefs) {
                const htmlElement = document.createElement("link");

                prs.push(
                    new Promise<void>(resolve =>
                        htmlElement.addEventListener("load", () => resolve())
                    )
                );

                htmlElement.rel = "stylesheet";

                htmlElement.href = href;

                if (lastMountedHtmlElement !== undefined) {
                    lastMountedHtmlElement.insertAdjacentElement("afterend", htmlElement);
                } else {
                    document.head.prepend(htmlElement);
                }

                lastMountedHtmlElement = htmlElement;
            }

            Promise.all(prs).then(() => {
                if (!isActive) {
                    return;
                }
                obsAreAllStyleSheetsLoaded.current = true;
            });

            return () => {
                isActive = false;
            };
        }, []);

        return { areAllStyleSheetsLoaded: obsAreAllStyleSheetsLoaded.current };
    }

    return { useInsertLinkTags };
}
