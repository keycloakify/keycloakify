import { clsx } from "keycloakify/tools/clsx";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function WebauthnError(props: PageProps<Extract<KcContext, { pageId: "webauthn-error.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { url, isAppInitiatedAction } = kcContext;

    const { msg, msgStr } = i18n;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    return (
        <Template {...{ kcContext, i18n, doUseDefaultCss, classes }} displayMessage headerNode={msg("webauthn-error-title")}>
            <form id="kc-error-credential-form" className={getClassName("kcFormClass")} action={url.loginAction} method="post">
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
                className={clsx(
                    getClassName("kcButtonClass"),
                    getClassName("kcButtonPrimaryClass"),
                    getClassName("kcButtonBlockClass"),
                    getClassName("kcButtonLargeClass")
                )}
                name="try-again"
                id="kc-try-again"
                value={msgStr("doTryAgain")}
            />
            {isAppInitiatedAction && (
                <form action={url.loginAction} className={getClassName("kcFormClass")} id="kc-webauthn-settings-form" method="post">
                    <button
                        type="submit"
                        className={clsx(
                            getClassName("kcButtonClass"),
                            getClassName("kcButtonDefaultClass"),
                            getClassName("kcButtonBlockClass"),
                            getClassName("kcButtonLargeClass")
                        )}
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
