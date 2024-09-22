import { useEffect } from "react";
import { assert } from "keycloakify/tools/assert";
import { useInsertScriptTags } from "keycloakify/tools/useInsertScriptTags";
import { useInsertLinkTags } from "keycloakify/tools/useInsertLinkTags";
import type { KcContext } from "keycloakify/login/KcContext";

export type KcContextLike = {
    url: {
        resourcesCommonPath: string;
        resourcesPath: string;
        ssoLoginInOtherTabsUrl: string;
    };
    scripts: string[];
};

assert<keyof KcContextLike extends keyof KcContext ? true : false>();
assert<KcContext extends KcContextLike ? true : false>();

export function useInitialize(params: {
    kcContext: KcContextLike;
    doUseDefaultCss: boolean;
}) {
    const { kcContext, doUseDefaultCss } = params;

    const { url, scripts } = kcContext;

    const { areAllStyleSheetsLoaded } = useInsertLinkTags({
        componentOrHookName: "Template",
        hrefs: !doUseDefaultCss
            ? []
            : [
                  `${url.resourcesCommonPath}/node_modules/@patternfly/patternfly/patternfly.min.css`,
                  `${url.resourcesCommonPath}/node_modules/patternfly/dist/css/patternfly.min.css`,
                  `${url.resourcesCommonPath}/node_modules/patternfly/dist/css/patternfly-additions.min.css`,
                  `${url.resourcesCommonPath}/lib/pficon/pficon.css`,
                  `${url.resourcesPath}/css/login.css`
              ]
    });

    const { insertScriptTags } = useInsertScriptTags({
        componentOrHookName: "Template",
        scriptTags: [
            // NOTE: The importmap is added in by the FTL script because it's too late to add it here.
            {
                type: "module",
                src: `${url.resourcesPath}/js/menu-button-links.js`
            },
            ...scripts.map(src => ({
                type: "text/javascript" as const,
                src
            })),
            {
                type: "module",
                textContent: `
                    import { checkCookiesAndSetTimer } from "${url.resourcesPath}/js/authChecker.js";

                    checkCookiesAndSetTimer("${url.ssoLoginInOtherTabsUrl}");
                `
            }
        ]
    });

    useEffect(() => {
        if (areAllStyleSheetsLoaded) {
            insertScriptTags();
        }
    }, [areAllStyleSheetsLoaded]);

    return { isReadyToRender: areAllStyleSheetsLoaded };
}
