import { useReducer, useEffect } from "react";
import { headInsert } from "keycloakify/tools/headInsert";
import { pathJoin } from "keycloakify/bin/tools/pathJoin";
import { clsx } from "keycloakify/tools/clsx";

export function usePrepareTemplate(params: {
    doFetchDefaultThemeResources: boolean;
    stylesCommon?: string[];
    styles?: string[];
    scripts?: string[];
    url: {
        resourcesCommonPath: string;
        resourcesPath: string;
    };
    htmlClassName: string | undefined;
    bodyClassName: string | undefined;
}) {
    const { doFetchDefaultThemeResources, stylesCommon, styles, url, scripts, htmlClassName, bodyClassName } = params;

    const [isReady, setReady] = useReducer(() => true, !doFetchDefaultThemeResources);

    useEffect(() => {
        if (!doFetchDefaultThemeResources) {
            return;
        }

        let isUnmounted = false;

        Promise.all(
            [
                ...(stylesCommon ?? []).map(relativePath => pathJoin(url.resourcesCommonPath, relativePath)),
                ...(styles ?? []).map(relativePath => pathJoin(url.resourcesPath, relativePath))
            ]
                .reverse()
                .map(href =>
                    headInsert({
                        "type": "css",
                        href,
                        "position": "prepend"
                    })
                )
        ).then(() => {
            if (isUnmounted) {
                return;
            }

            setReady();
        });

        (scripts ?? []).forEach(relativePath =>
            headInsert({
                "type": "javascript",
                "src": pathJoin(url.resourcesPath, relativePath)
            })
        );

        return () => {
            isUnmounted = true;
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

        const htmlClassList = document.getElementsByTagName("html")[0].classList;

        const tokens = clsx(target).split(" ");

        htmlClassList.add(...tokens);

        return () => {
            htmlClassList.remove(...tokens);
        };
    }, [className]);
}
