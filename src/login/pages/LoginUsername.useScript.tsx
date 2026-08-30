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
    mediation?: string;
    authenticatorAttachment?: string;
    enableWebAuthnConditionalUI?: boolean;
};

assert<keyof KcContextLike extends keyof KcContext.LoginUsername ? true : false>();
assert<KcContext.LoginUsername extends KcContextLike ? true : false>();

type I18nLike = {
    msgStr: (key: "webauthn-unsupported-browser-text" | "passkey-unsupported-browser-text") => string;
    isFetchingTranslations: boolean;
};

export function useScript(params: { webAuthnButtonId: string; kcContext: KcContextLike; i18n: I18nLike }) {
    const { webAuthnButtonId, kcContext, i18n } = params;

    const { url, isUserIdentified, challenge, userVerification, rpId, createTimeout, mediation, authenticatorAttachment } = kcContext;

    const { msgStr, isFetchingTranslations } = i18n;

    const { insertScriptTags } = useInsertScriptTags({
        componentOrHookName: "LoginUsername",
        scriptTags: [
            {
                type: "module",
                textContent: () => `

                    import { authenticateByWebAuthn } from "${url.resourcesPath}/js/webauthnAuthenticate.js";
                    import { initAuthenticate } from "${url.resourcesPath}/js/passkeysConditionalAuth.js";
                    const authButton = document.getElementById('${webAuthnButtonId}');
                    const input = {
                        isUserIdentified : ${isUserIdentified},
                        challenge : ${JSON.stringify(challenge)},
                        userVerification : ${JSON.stringify(userVerification)},
                        rpId : ${JSON.stringify(rpId)},
                        createTimeout : ${JSON.stringify(createTimeout)},
                        mediation : ${JSON.stringify(mediation)},
                        authenticatorAttachment : ${JSON.stringify(authenticatorAttachment)}
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
                    });
                `
            }
        ]
    });

    useEffect(() => {
        if (isFetchingTranslations || kcContext.enableWebAuthnConditionalUI !== true) {
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
