import React, { useCallback, useRef, useState, memo } from "react";
import Template from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { useCssAndCx } from "../tools/useCssAndCx";
import type { I18n, MessageKeyBase } from "../i18n";
import { base64url } from "rfc4648";

const WebauthnAuthenticate = memo(
    ({
        kcContext,
        i18n,
        doFetchDefaultThemeResources = true,
        ...props
    }: { kcContext: KcContextBase.WebauthnAuthenticate; i18n: I18n; doFetchDefaultThemeResources?: boolean } & KcProps) => {
        const { url } = kcContext;

        const { msg, msgStr } = i18n;

        const { authenticators, challenge, shouldDisplayAuthenticators, userVerification, rpId } = kcContext;
        const createTimeout = Number(kcContext.createTimeout);
        const isUserIdentified = kcContext.isUserIdentified == "true";

        const { cx } = useCssAndCx();

        const webAuthnAuthenticate = useCallback(() => {
            if (!isUserIdentified) {
                return;
            }
            checkAllowCredentials();

            function checkAllowCredentials() {
                const allowCredentials = authenticators.authenticators.map(
                    authenticator =>
                        ({
                            id: base64url.parse(authenticator.credentialId, { loose: true }),
                            type: "public-key"
                        } as PublicKeyCredentialDescriptor)
                );
                doAuthenticate(allowCredentials);
            }
            function doAuthenticate(allowCredentials: PublicKeyCredentialDescriptor[]) {
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

                navigator.credentials
                    .get({ publicKey })
                    .then(resultRaw => {
                        if (!resultRaw || resultRaw.type != "public-key") return;
                        const result = resultRaw as PublicKeyCredential;
                        if (!("authenticatorData" in result.response)) return;
                        const response = result.response as AuthenticatorAssertionResponse;
                        let clientDataJSON = response.clientDataJSON;
                        let authenticatorData = response.authenticatorData;
                        let signature = response.signature;

                        setClientDataJSON(base64url.stringify(new Uint8Array(clientDataJSON), { pad: false }));
                        setAuthenticatorData(base64url.stringify(new Uint8Array(authenticatorData), { pad: false }));
                        setSignature(base64url.stringify(new Uint8Array(signature), { pad: false }));
                        setCredentialId(result.id);
                        setUserHandle(base64url.stringify(new Uint8Array(response.userHandle!), { pad: false }));
                        submitForm();
                    })
                    .catch(err => {
                        setError(err);
                        submitForm();
                    });
            }
        }, [kcContext]);

        const webAuthForm = useRef<HTMLFormElement>(null);
        const submitForm = useCallback(() => {
            webAuthForm.current!.submit();
        }, [webAuthForm.current]);

        const [clientDataJSON, setClientDataJSON] = useState("");
        const [authenticatorData, setAuthenticatorData] = useState("");
        const [signature, setSignature] = useState("");
        const [credentialId, setCredentialId] = useState("");
        const [userHandle, setUserHandle] = useState("");
        const [error, setError] = useState("");

        return (
            <Template
                {...{ kcContext, i18n, doFetchDefaultThemeResources, ...props }}
                headerNode={msg("webauthn-login-title")}
                formNode={
                    <div id="kc-form-webauthn" className={cx(props.kcFormClass)}>
                        <form id="webauth" action={url.loginAction} ref={webAuthForm} method="post">
                            <input type="hidden" id="clientDataJSON" name="clientDataJSON" value={clientDataJSON} />
                            <input type="hidden" id="authenticatorData" name="authenticatorData" value={authenticatorData} />
                            <input type="hidden" id="signature" name="signature" value={signature} />
                            <input type="hidden" id="credentialId" name="credentialId" value={credentialId} />
                            <input type="hidden" id="userHandle" name="userHandle" value={userHandle} />
                            <input type="hidden" id="error" name="error" value={error} />
                        </form>
                        <div className={cx(props.kcFormGroupClass)}>
                            {authenticators &&
                                (() => (
                                    <form id="authn_select" className={cx(props.kcFormClass)}>
                                        {authenticators.authenticators.map(authenticator => (
                                            <input
                                                type="hidden"
                                                name="authn_use_chk"
                                                value={authenticator.credentialId}
                                                key={authenticator.credentialId}
                                            />
                                        ))}
                                    </form>
                                ))()}
                            {authenticators &&
                                shouldDisplayAuthenticators &&
                                (() => (
                                    <>
                                        {authenticators.authenticators.length > 1 && (
                                            <p className={cx(props.kcSelectAuthListItemTitle)}>{msg("webauthn-available-authenticators")}</p>
                                        )}
                                        <div className={cx(props.kcFormClass)}>
                                            {authenticators.authenticators.map(authenticator => (
                                                <div id="kc-webauthn-authenticator" className={cx(props.kcSelectAuthListItemClass)}>
                                                    <div className={cx(props.kcSelectAuthListItemIconClass)}>
                                                        <i
                                                            className={cx(
                                                                props[authenticator.transports.iconClass] ?? props.kcWebAuthnDefaultIcon,
                                                                props.kcSelectAuthListItemIconPropertyClass
                                                            )}
                                                        />
                                                    </div>
                                                    <div className={cx(props.kcSelectAuthListItemBodyClass)}>
                                                        <div
                                                            id="kc-webauthn-authenticator-label"
                                                            className={cx(props.kcSelectAuthListItemHeadingClass)}
                                                        >
                                                            {authenticator.label}
                                                        </div>

                                                        {authenticator.transports && authenticator.transports.displayNameProperties.length && (
                                                            <div
                                                                id="kc-webauthn-authenticator-transport"
                                                                className={cx(props.kcSelectAuthListItemDescriptionClass)}
                                                            >
                                                                {authenticator.transports.displayNameProperties.map(
                                                                    (transport: MessageKeyBase, index: number) => (
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

                                                        <div className={cx(props.kcSelectAuthListItemDescriptionClass)}>
                                                            <span id="kc-webauthn-authenticator-created-label">
                                                                {msg("webauthn-createdAt-label")}
                                                            </span>
                                                            <span id="kc-webauthn-authenticator-created">{authenticator.createdAt}</span>
                                                        </div>
                                                    </div>
                                                    <div className={cx(props.kcSelectAuthListItemFillClass)} />
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ))()}
                            <div id="kc-form-buttons" className={cx(props.kcFormButtonsClass)}>
                                <input
                                    id="authenticateWebAuthnButton"
                                    type="button"
                                    onClick={webAuthnAuthenticate}
                                    autoFocus={true}
                                    value={msgStr("webauthn-doAuthenticate")}
                                    className={cx(
                                        props.kcButtonClass,
                                        props.kcButtonPrimaryClass,
                                        props.kcButtonBlockClass,
                                        props.kcButtonLargeClass
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                }
            />
        );
    }
);

export default WebauthnAuthenticate;
