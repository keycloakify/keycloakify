import { useRef, useState } from "react";
import { clsx } from "keycloakify/tools/clsx";
import type { MessageKey } from "keycloakify/login/i18n/i18n";
import { base64url } from "rfc4648";
import { useConstCallback } from "keycloakify/tools/useConstCallback";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";

export default function WebauthnAuthenticate(props: PageProps<Extract<KcContext, { pageId: "webauthn-authenticate.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({ doUseDefaultCss, classes });

    const { url } = kcContext;

    const { msg, msgStr } = i18n;

    const { authenticators, challenge, shouldDisplayAuthenticators, userVerification, rpId } = kcContext;
    const createTimeout = Number(kcContext.createTimeout);
    const isUserIdentified = kcContext.isUserIdentified == "true";

    const webAuthnAuthenticate = useConstCallback(async () => {
        if (!isUserIdentified) {
            return;
        }
        const allowCredentials = authenticators.authenticators.map(
            authenticator =>
                ({
                    id: base64url.parse(authenticator.credentialId, { loose: true }),
                    type: "public-key"
                } as PublicKeyCredentialDescriptor)
        );
        // Check if WebAuthn is supported by this browser
        if (!window.PublicKeyCredential) {
            setError(msgStr("webauthn-unsupported-browser-text"));
            submitForm();
            return;
        }

        const publicKey: PublicKeyCredentialRequestOptions = {
            rpId,
            challenge: base64url.parse(challenge, { loose: true })
        };

        if (createTimeout !== 0) {
            publicKey.timeout = createTimeout * 1000;
        }

        if (allowCredentials.length) {
            publicKey.allowCredentials = allowCredentials;
        }

        if (userVerification !== "not specified") {
            publicKey.userVerification = userVerification;
        }

        try {
            const resultRaw = await navigator.credentials.get({ publicKey });
            if (!resultRaw || resultRaw.type != "public-key") return;
            const result = resultRaw as PublicKeyCredential;
            if (!("authenticatorData" in result.response)) return;
            const response = result.response as AuthenticatorAssertionResponse;
            const clientDataJSON = response.clientDataJSON;
            const authenticatorData = response.authenticatorData;
            const signature = response.signature;

            setClientDataJSON(base64url.stringify(new Uint8Array(clientDataJSON), { pad: false }));
            setAuthenticatorData(base64url.stringify(new Uint8Array(authenticatorData), { pad: false }));
            setSignature(base64url.stringify(new Uint8Array(signature), { pad: false }));
            setCredentialId(result.id);
            setUserHandle(base64url.stringify(new Uint8Array(response.userHandle!), { pad: false }));
            submitForm();
        } catch (err) {
            setError(String(err));
            submitForm();
        }
    });

    const webAuthForm = useRef<HTMLFormElement>(null);
    const submitForm = useConstCallback(() => {
        webAuthForm.current!.submit();
    });

    const [clientDataJSON, setClientDataJSON] = useState("");
    const [authenticatorData, setAuthenticatorData] = useState("");
    const [signature, setSignature] = useState("");
    const [credentialId, setCredentialId] = useState("");
    const [userHandle, setUserHandle] = useState("");
    const [error, setError] = useState("");

    return (
        <Template {...{ kcContext, i18n, doUseDefaultCss, classes }} headerNode={msg("webauthn-login-title")}>
            <div id="kc-form-webauthn" className={getClassName("kcFormClass")}>
                <form id="webauth" action={url.loginAction} ref={webAuthForm} method="post">
                    <input type="hidden" id="clientDataJSON" name="clientDataJSON" value={clientDataJSON} />
                    <input type="hidden" id="authenticatorData" name="authenticatorData" value={authenticatorData} />
                    <input type="hidden" id="signature" name="signature" value={signature} />
                    <input type="hidden" id="credentialId" name="credentialId" value={credentialId} />
                    <input type="hidden" id="userHandle" name="userHandle" value={userHandle} />
                    <input type="hidden" id="error" name="error" value={error} />
                </form>
                <div className={getClassName("kcFormGroupClass")}>
                    {authenticators &&
                        (() => (
                            <form id="authn_select" className={getClassName("kcFormClass")}>
                                {authenticators.authenticators.map(authenticator => (
                                    <input type="hidden" name="authn_use_chk" value={authenticator.credentialId} key={authenticator.credentialId} />
                                ))}
                            </form>
                        ))()}
                    {authenticators &&
                        shouldDisplayAuthenticators &&
                        (() => (
                            <>
                                {authenticators.authenticators.length > 1 && (
                                    <p className={getClassName("kcSelectAuthListItemTitle")}>{msg("webauthn-available-authenticators")}</p>
                                )}
                                <div className={getClassName("kcFormClass")}>
                                    {authenticators.authenticators.map(authenticator => (
                                        <div id="kc-webauthn-authenticator" className={getClassName("kcSelectAuthListItemClass")}>
                                            <div className={getClassName("kcSelectAuthListItemIconClass")}>
                                                <i
                                                    className={clsx(
                                                        (() => {
                                                            const className = getClassName(authenticator.transports.iconClass as any);
                                                            return className.includes(" ")
                                                                ? className
                                                                : [className, getClassName("kcWebAuthnDefaultIcon")];
                                                        })(),
                                                        getClassName("kcSelectAuthListItemIconPropertyClass")
                                                    )}
                                                />
                                            </div>
                                            <div className={getClassName("kcSelectAuthListItemBodyClass")}>
                                                <div
                                                    id="kc-webauthn-authenticator-label"
                                                    className={getClassName("kcSelectAuthListItemHeadingClass")}
                                                >
                                                    {authenticator.label}
                                                </div>

                                                {authenticator.transports && authenticator.transports.displayNameProperties.length && (
                                                    <div
                                                        id="kc-webauthn-authenticator-transport"
                                                        className={getClassName("kcSelectAuthListItemDescriptionClass")}
                                                    >
                                                        {authenticator.transports.displayNameProperties.map(
                                                            (transport: MessageKey, index: number) => (
                                                                <>
                                                                    <span>{msg(transport)}</span>
                                                                    {index < authenticator.transports.displayNameProperties.length - 1 && (
                                                                        <span>{", "}</span>
                                                                    )}
                                                                </>
                                                            )
                                                        )}
                                                    </div>
                                                )}

                                                <div className={getClassName("kcSelectAuthListItemDescriptionClass")}>
                                                    <span id="kc-webauthn-authenticator-created-label">{msg("webauthn-createdAt-label")}</span>
                                                    <span id="kc-webauthn-authenticator-created">{authenticator.createdAt}</span>
                                                </div>
                                            </div>
                                            <div className={getClassName("kcSelectAuthListItemFillClass")} />
                                        </div>
                                    ))}
                                </div>
                            </>
                        ))()}
                    <div id="kc-form-buttons" className={getClassName("kcFormButtonsClass")}>
                        <input
                            id="authenticateWebAuthnButton"
                            type="button"
                            onClick={webAuthnAuthenticate}
                            autoFocus={true}
                            value={msgStr("webauthn-doAuthenticate")}
                            className={clsx(
                                getClassName("kcButtonClass"),
                                getClassName("kcButtonPrimaryClass"),
                                getClassName("kcButtonBlockClass"),
                                getClassName("kcButtonLargeClass")
                            )}
                        />
                    </div>
                </div>
            </div>
        </Template>
    );
}
