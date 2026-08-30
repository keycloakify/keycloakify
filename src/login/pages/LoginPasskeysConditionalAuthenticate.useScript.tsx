import { useEffect } from "react";
import { useInsertScriptTags } from "keycloakify/tools/useInsertScriptTags";
import { assert } from "keycloakify/tools/assert";
import { KcContext } from "keycloakify/login/KcContext/KcContext";
import { waitForElementMountedOnDom } from "keycloakify/tools/waitForElementMountedOnDom";

type KcContextLike = {
    url: {
        resourcesPath: string;
    };
    isUserIdentified: boolean | "true" | "false";
    challenge: string;
    userVerification: string;
    rpId: string;
    createTimeout: number | string;
};

assert<keyof KcContextLike extends keyof KcContext.LoginPasskeysConditionalAuthenticate ? true : false>();
assert<KcContext.LoginPasskeysConditionalAuthenticate extends KcContextLike ? true : false>();

type I18nLike = {
    msgStr: (key: "webauthn-unsupported-browser-text" | "passkey-unsupported-browser-text") => string;
    isFetchingTranslations: boolean;
};

export function useScript(params: { authButtonId: string; kcContext: KcContextLike; i18n: I18nLike }) {
    const { authButtonId, kcContext, i18n } = params;

    const { url, isUserIdentified, challenge, userVerification, rpId, createTimeout } = kcContext;

    const { msgStr, isFetchingTranslations } = i18n;

    const { insertScriptTags } = useInsertScriptTags({
        componentOrHookName: "LoginPasskeysConditionalAuthenticate",
        scriptTags: [
            {
                type: "module",
                textContent: () => `
                    import { authenticateByWebAuthn } from "${url.resourcesPath}/js/webauthnAuthenticate.js";
                    import { initAuthenticate } from "${url.resourcesPath}/js/passkeysConditionalAuth.js";

                    const authButton = document.getElementById("${authButtonId}");
                    const input = {
                        isUserIdentified : ${isUserIdentified},
                        challenge : ${JSON.stringify(challenge)},
                        userVerification : ${JSON.stringify(userVerification)},
                        rpId : ${JSON.stringify(rpId)},
                        createTimeout : ${JSON.stringify(createTimeout)}
                    };
                    authButton.addEventListener("click", () => {
                        authenticateByWebAuthn({
                            ...input,
                            errmsg : ${JSON.stringify(msgStr("webauthn-unsupported-browser-text"))}
                        });
                    }, { once: true });

                    initAuthenticate({
                        ...input,
                        errmsg : ${JSON.stringify(msgStr("passkey-unsupported-browser-text"))}
                    }, available => {
                        const loginForm = document.getElementById("kc-form-login");
                        const passkeyButton = document.getElementById("kc-form-passkey-button");

                        if (!loginForm || !passkeyButton) {
                            return;
                        }

                        if (available) {
                            loginForm.style.display = "block";
                        } else {
                            passkeyButton.style.display = "block";
                        }
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
                elementId: authButtonId
            });

            insertScriptTags();
        })();
    }, [isFetchingTranslations]);
}
