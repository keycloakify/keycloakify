/**
 * Hook to wire WebAuthn passkey authentication on the password step (login-password.ftl).
 * Mirrors Login.useScript but scoped to the second step of the flow.
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

assert<keyof KcContextLike extends keyof KcContext.LoginPassword ? true : false>();
assert<KcContext.LoginPassword extends KcContextLike ? true : false>();

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
        componentOrHookName: "LoginPassword",
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
