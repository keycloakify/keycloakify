import { useEffect, Fragment } from "react";
import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useInsertScriptTags } from "keycloakify/tools/useInsertScriptTags";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import { assert } from "keycloakify/tools/assert";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

// NOTE: From Keycloak 25.0.4
export default function LoginPasskeysConditionalAuthenticate(
    props: PageProps<Extract<KcContext, { pageId: "login-passkeys-conditional-authenticate.ftl" }>, I18n>
) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const {
        messagesPerField,
        login,
        url,
        usernameHidden,
        shouldDisplayAuthenticators,
        authenticators,
        registrationDisabled,
        realm,
        isUserIdentified,
        challenge,
        userVerification,
        rpId,
        createTimeout
    } = kcContext;

    const { msg, msgStr, advancedMsg } = i18n;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { insertScriptTags } = useInsertScriptTags({
        componentOrHookName: "LoginRecoveryAuthnCodeConfig",
        scriptTags: [
            {
                type: "module",
                textContent: `
                    import { authenticateByWebAuthn } from "${url.resourcesPath}/js/webauthnAuthenticate.js";
                    import { initAuthenticate } from "${url.resourcesPath}/js/passkeysConditionalAuth.js";

                    const authButton = document.getElementById('authenticateWebAuthnButton');
                    const input = {
                        isUserIdentified : ${isUserIdentified},
                        challenge : '${challenge}',
                        userVerification : '${userVerification}',
                        rpId : '${rpId}',
                        createTimeout : ${createTimeout},
                        errmsg : "${msgStr("webauthn-unsupported-browser-text")}"
                    };
                    authButton.addEventListener("click", () => {
                        authenticateByWebAuthn(input);
                    });

                    const args = {
                        isUserIdentified : ${isUserIdentified},
                        challenge : '${challenge}',
                        userVerification : '${userVerification}',
                        rpId : '${rpId}',
                        createTimeout : ${createTimeout},
                        errmsg : "${msgStr("passkey-unsupported-browser-text")}"
                    };

                    document.addEventListener("DOMContentLoaded", (event) => initAuthenticate(args));
                `
            }
        ]
    });

    useEffect(() => {
        insertScriptTags();
    }, []);

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            headerNode={msg("passkey-login-title")}
            infoNode={
                realm.registrationAllowed &&
                !registrationDisabled && (
                    <div id="kc-registration">
                        <span>
                            ${msg("noAccount")}{" "}
                            <a tabIndex={6} href={url.registrationUrl}>
                                {msg("doRegister")}
                            </a>
                        </span>
                    </div>
                )
            }
        >
            <form id="webauth" action={url.loginAction} method="post">
                <input type="hidden" id="clientDataJSON" name="clientDataJSON" />
                <input type="hidden" id="authenticatorData" name="authenticatorData" />
                <input type="hidden" id="signature" name="signature" />
                <input type="hidden" id="credentialId" name="credentialId" />
                <input type="hidden" id="userHandle" name="userHandle" />
                <input type="hidden" id="error" name="error" />
            </form>

            <div className={kcClsx("kcFormGroupClass")} no-bottom-margin="true" style={{ marginBottom: 0 }}>
                {authenticators !== undefined && Object.keys(authenticators).length !== 0 && (
                    <>
                        <form id="authn_select" className={kcClsx("kcFormClass")}>
                            {authenticators.authenticators.map((authenticator, i) => (
                                <input key={i} type="hidden" name="authn_use_chk" readOnly value={authenticator.credentialId} />
                            ))}
                        </form>
                        {shouldDisplayAuthenticators && (
                            <>
                                {authenticators.authenticators.length > 1 && (
                                    <p className={kcClsx("kcSelectAuthListItemTitle")}>{msg("passkey-available-authenticators")}</p>
                                )}
                                <div className={kcClsx("kcFormClass")}>
                                    {authenticators.authenticators.map((authenticator, i) => (
                                        <div key={i} id={`kc-webauthn-authenticator-item-${i}`} className={kcClsx("kcSelectAuthListItemClass")}>
                                            <i
                                                className={clsx(
                                                    (() => {
                                                        const className = kcClsx(authenticator.transports.iconClass as any);
                                                        if (className === authenticator.transports.iconClass) {
                                                            return kcClsx("kcWebAuthnDefaultIcon");
                                                        }
                                                        return className;
                                                    })(),
                                                    kcClsx("kcSelectAuthListItemIconPropertyClass")
                                                )}
                                            />
                                            <div className={kcClsx("kcSelectAuthListItemBodyClass")}>
                                                <div
                                                    id={`kc-webauthn-authenticator-label-${i}`}
                                                    className={kcClsx("kcSelectAuthListItemHeadingClass")}
                                                >
                                                    {advancedMsg(authenticator.label)}
                                                </div>
                                                {authenticator.transports !== undefined &&
                                                    authenticator.transports.displayNameProperties !== undefined &&
                                                    authenticator.transports.displayNameProperties.length !== 0 && (
                                                        <div
                                                            id={`kc-webauthn-authenticator-transport-${i}`}
                                                            className={kcClsx("kcSelectAuthListItemDescriptionClass")}
                                                        >
                                                            {authenticator.transports.displayNameProperties.map((nameProperty, i, arr) => (
                                                                <Fragment key={i}>
                                                                    <span key={i}> {advancedMsg(nameProperty)} </span>
                                                                    {i !== arr.length - 1 && <span>, </span>}
                                                                </Fragment>
                                                            ))}
                                                        </div>
                                                    )}
                                                <div className={kcClsx("kcSelectAuthListItemDescriptionClass")}>
                                                    <span id={`kc-webauthn-authenticator-createdlabel-${i}`}>{msg("passkey-createdAt-label")}</span>
                                                    <span id={`kc-webauthn-authenticator-created-${i}`}>{authenticator.createdAt}</span>
                                                </div>
                                            </div>
                                            <div className={kcClsx("kcSelectAuthListItemFillClass")} />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        <div id="kc-form">
                            <div id="kc-form-wrapper">
                                {realm.password && (
                                    <form
                                        id="kc-form-passkey"
                                        action={url.loginAction}
                                        method="post"
                                        style={{ display: "none" }}
                                        onSubmit={event => {
                                            try {
                                                // @ts-expect-error
                                                event.target.login.disabled = true;
                                            } catch {}

                                            return true;
                                        }}
                                    >
                                        {!usernameHidden && (
                                            <div className={kcClsx("kcFormGroupClass")}>
                                                <label htmlFor="username" className={kcClsx("kcLabelClass")}>
                                                    {msg("passkey-autofill-select")}
                                                </label>
                                                <input
                                                    tabIndex={1}
                                                    id="username"
                                                    aria-invalid={messagesPerField.existsError("username")}
                                                    className={kcClsx("kcInputClass")}
                                                    name="username"
                                                    defaultValue={login.username ?? ""}
                                                    //autoComplete="username webauthn"
                                                    type="text"
                                                    autoFocus
                                                    autoComplete="off"
                                                />
                                                {messagesPerField.existsError("username") && (
                                                    <span id="input-error-username" className={kcClsx("kcInputErrorMessageClass")} aria-live="polite">
                                                        {messagesPerField.get("username")}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </form>
                                )}
                                <div id="kc-form-passkey-button" className={kcClsx("kcFormButtonsClass")} style={{ display: "none" }}>
                                    <input
                                        id="authenticateWebAuthnButton"
                                        type="button"
                                        onClick={() => {
                                            assert("doAuthenticate" in window);
                                            assert(typeof window.doAuthenticate === "function");
                                            window.doAuthenticate(
                                                [],
                                                rpId,
                                                challenge,
                                                typeof isUserIdentified === "boolean" ? isUserIdentified : isUserIdentified === "true",
                                                createTimeout,
                                                userVerification,
                                                msgStr("passkey-unsupported-browser-text")
                                            );
                                        }}
                                        autoFocus
                                        value={msgStr("passkey-doAuthenticate")}
                                        className={kcClsx("kcButtonClass", "kcButtonPrimaryClass", "kcButtonBlockClass", "kcButtonLargeClass")}
                                    />
                                </div>
                                <div id="kc-form-passkey-button" className={kcClsx("kcFormButtonsClass")} style={{ display: "none" }}>
                                    <input
                                        id="authenticateWebAuthnButton"
                                        type="button"
                                        autoFocus
                                        value={msgStr("passkey-doAuthenticate")}
                                        className={kcClsx("kcButtonClass", "kcButtonPrimaryClass", "kcButtonBlockClass", "kcButtonLargeClass")}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Template>
    );
}
