import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function WebauthnError(props: PageProps<Extract<KcContext, { pageId: "webauthn-error.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { url, isAppInitiatedAction } = kcContext;

    const { msg, msgStr } = i18n;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage
            headerNode={msg("webauthn-error-title")}
        >
            <form id="kc-error-credential-form" className={kcClsx("kcFormClass")} action={url.loginAction} method="post">
                <input type="hidden" id="executionValue" name="authenticationExecution" />
                <input type="hidden" id="isSetRetry" name="isSetRetry" />
            </form>
            <input
                tabIndex={4}
                onClick={() => {
                    // @ts-expect-error: Trusted Keycloak's code
                    document.getElementById("isSetRetry").value = "retry";
                    // @ts-expect-error: Trusted Keycloak's code
                    document.getElementById("executionValue").value = "${execution}";
                    // @ts-expect-error: Trusted Keycloak's code
                    document.getElementById("kc-error-credential-form").submit();
                }}
                type="button"
                className={kcClsx("kcButtonClass", "kcButtonPrimaryClass", "kcButtonBlockClass", "kcButtonLargeClass")}
                name="try-again"
                id="kc-try-again"
                value={msgStr("doTryAgain")}
            />
            {isAppInitiatedAction && (
                <form action={url.loginAction} className={kcClsx("kcFormClass")} id="kc-webauthn-settings-form" method="post">
                    <button
                        type="submit"
                        className={kcClsx("kcButtonClass", "kcButtonDefaultClass", "kcButtonBlockClass", "kcButtonLargeClass")}
                        id="cancelWebAuthnAIA"
                        name="cancel-aia"
                        value="true"
                    >
                        {msgStr("doCancel")}
                    </button>
                </form>
            )}
        </Template>
    );
}
