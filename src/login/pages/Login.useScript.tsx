/**
 * Hook to wire WebAuthn passkey authentication on the combined login form (login.ftl).
 * It injects a script that triggers navigator.credentials.get() via Keycloak's webauthnAuthenticate.js
 * only once translations are ready and required WebAuthn parameters are present.
 */
import { useEffect } from "react";
import { useInsertScriptTags } from "keycloakify/tools/useInsertScriptTags";
import { assert } from "keycloakify/tools/assert";
import { KcContext } from "keycloakify/login/KcContext/KcContext";
import { waitForElementMountedOnDom } from "keycloakify/tools/waitForElementMountedOnDom";

type KcContextLike = {
    url: {
        resourcesPath: string;
    };
    isUserIdentified?: "true" | "false" | boolean;
    challenge?: string;
    userVerification?: string;
    rpId?: string;
    createTimeout?: number | string;
};

assert<keyof KcContextLike extends keyof KcContext.Login ? true : false>();
assert<KcContext.Login extends KcContextLike ? true : false>();

type I18nLike = {
    msgStr: (key: "webauthn-unsupported-browser-text") => string;
    isFetchingTranslations: boolean;
};

/** Injects the WebAuthn authentication script and binds click listener to the passkey button. */
export function useScript(params: { authButtonId: string; kcContext: KcContextLike; i18n: I18nLike }) {
    const { authButtonId, kcContext, i18n } = params;

    const { url, isUserIdentified, challenge, userVerification, rpId, createTimeout } = kcContext;

    const { msgStr, isFetchingTranslations } = i18n;

    const { insertScriptTags } = useInsertScriptTags({
        componentOrHookName: "Login",
        scriptTags: [
            {
                type: "module",
                textContent: () => `

                    import { authenticateByWebAuthn } from "${url.resourcesPath}/js/webauthnAuthenticate.js";
                    const authButton = document.getElementById('${authButtonId}');
                    authButton.addEventListener("click", function() {
                        const input = {
                            isUserIdentified : ${JSON.stringify(isUserIdentified ?? false)},
                            challenge : ${JSON.stringify(challenge ?? "")},
                            userVerification : ${JSON.stringify(userVerification ?? "")},
                            rpId : ${JSON.stringify(rpId ?? "")},
                            createTimeout : ${JSON.stringify(createTimeout ?? 0)},
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

        // Only insert script if required WebAuthn parameters are present
        if (!challenge || !userVerification || !rpId || createTimeout === undefined) {
            return;
        }

        (async () => {
            await waitForElementMountedOnDom({
                elementId: authButtonId
            });

            insertScriptTags();
        })();
    }, [isFetchingTranslations, challenge, userVerification, rpId, createTimeout]);
}
