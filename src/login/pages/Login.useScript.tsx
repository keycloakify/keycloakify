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

/**
 * Injects a module script that wires WebAuthn authentication to the specified button when translations are loaded and required context values are available.
 *
 * The injected script attaches a click handler to the element identified by `authButtonId` which collects WebAuthn-related fields from `kcContext` and passes them (plus a translated error message from `i18n`) to the page's WebAuthn authentication routine.
 *
 * @param params.authButtonId - The DOM id of the button to attach the WebAuthn click handler to.
 * @param params.kcContext - Keycloak-like context providing values used by the injected script:
 *   - `url.resourcesPath` (string) — base path used to import the WebAuthn module,
 *   - `isUserIdentified`, `challenge`, `userVerification`, `rpId`, `createTimeout` — values forwarded into the authentication input.
 * @param params.i18n - Translation helpers:
 *   - `msgStr(key)` — used to obtain the localized unsupported-browser error message,
 *   - `isFetchingTranslations` — when true, prevents the script from being inserted until translations are ready.
 */
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
                            isUserIdentified : ${isUserIdentified ?? false},
                            challenge : '${challenge ?? ""}',
                            userVerification : '${userVerification ?? ""}',
                            rpId : '${rpId ?? ""}',
                            createTimeout : ${createTimeout ?? 0},
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

        // Only insert script if enableWebAuthnConditionalUI is true
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