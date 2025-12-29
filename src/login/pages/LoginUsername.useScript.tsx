import { useEffect } from "react";
import { useInsertScriptTags } from "keycloakify/tools/useInsertScriptTags";
import { assert } from "keycloakify/tools/assert";
import { KcContext } from "keycloakify/login/KcContext/KcContext";
import { waitForElementMountedOnDom } from "keycloakify/tools/waitForElementMountedOnDom";

type KcContextLike = {
    url: {
        resourcesPath: string;
    };
    isUserIdentified: "true" | "false";
    challenge: string;
    userVerification: KcContext.WebauthnAuthenticate["userVerification"];
    rpId: string;
    createTimeout: number | string;
};

assert<keyof KcContextLike extends keyof KcContext.LoginUsername ? true : false>();
assert<KcContext.LoginUsername extends KcContextLike ? true : false>();

type I18nLike = {
    msgStr: (key: "webauthn-unsupported-browser-text") => string;
    isFetchingTranslations: boolean;
};

export function useScript(params: { webAuthnButtonId: string; kcContext: KcContextLike; i18n: I18nLike }) {
    const { webAuthnButtonId, kcContext, i18n } = params;

    const { url, isUserIdentified, challenge, userVerification, rpId, createTimeout } = kcContext;

    const { msgStr, isFetchingTranslations } = i18n;

    const { insertScriptTags } = useInsertScriptTags({
        componentOrHookName: "LoginUsername",
        scriptTags: [
            {
                type: "module",
                textContent: () => `

                    import { authenticateByWebAuthn } from "${url.resourcesPath}/js/webauthnAuthenticate.js";
                    const authButton = document.getElementById('${webAuthnButtonId}');
                    authButton.addEventListener("click", function() {
                        const input = {
                            isUserIdentified : ${isUserIdentified},
                            challenge : '${challenge}',
                            userVerification : '${userVerification}',
                            rpId : '${rpId}',
                            createTimeout : ${createTimeout},
                            errmsg : ${JSON.stringify(msgStr("webauthn-unsupported-browser-text"))}
                        };
                        authenticateByWebAuthn(input);
                    });
                `
            }
        ]
    });

    useEffect(() => {
        if (isFetchingTranslations) {
            return;
        }

        (async () => {
            await waitForElementMountedOnDom({
                elementId: webAuthnButtonId
            });

            insertScriptTags();
        })();
    }, [isFetchingTranslations]);
}
