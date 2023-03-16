import React, { useRef, useState } from "react";
import { clsx } from "../tools/clsx";
import type { MessageKeyBase } from "../i18n";
import { base64url } from "rfc4648";
import { useConstCallback } from "../tools/useConstCallback";
import type { PageProps } from "../KcProps";
import type { KcContextBase } from "../kcContext";
import type { I18nBase } from "../i18n";

export default function WebauthnAuthenticate(props: PageProps<Extract<KcContextBase, { pageId: "webauthn-authenticate.ftl" }>, I18nBase>) {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template, ...kcProps } = props;

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
        <Template
            {...{ kcContext, i18n, doFetchDefaultThemeResources, ...kcProps }}
            headerNode={msg("webauthn-login-title")}
            formNode={
                <div id="kc-form-webauthn" className={clsx(kcProps.kcFormClass)}>
                    <form id="webauth" action={url.loginAction} ref={webAuthForm} method="post">
                        <input type="hidden" id="clientDataJSON" name="clientDataJSON" value={clientDataJSON} />
                        <input type="hidden" id="authenticatorData" name="authenticatorData" value={authenticatorData} />
                        <input type="hidden" id="signature" name="signature" value={signature} />
                        <input type="hidden" id="credentialId" name="credentialId" value={credentialId} />
                        <input type="hidden" id="userHandle" name="userHandle" value={userHandle} />
                        <input type="hidden" id="error" name="error" value={error} />
                    </form>
                    <div className={clsx(kcProps.kcFormGroupClass)}>
                        {authenticators &&
                            (() => (
                                <form id="authn_select" className={clsx(kcProps.kcFormClass)}>
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
                                        <p className={clsx(kcProps.kcSelectAuthListItemTitle)}>{msg("webauthn-available-authenticators")}</p>
                                    )}
                                    <div className={clsx(kcProps.kcFormClass)}>
                                        {authenticators.authenticators.map(authenticator => (
                                            <div id="kc-webauthn-authenticator" className={clsx(kcProps.kcSelectAuthListItemClass)}>
                                                <div className={clsx(kcProps.kcSelectAuthListItemIconClass)}>
                                                    <i
                                                        className={clsx(
                                                            kcProps[authenticator.transports.iconClass] ?? kcProps.kcWebAuthnDefaultIcon,
                                                            kcProps.kcSelectAuthListItemIconPropertyClass
                                                        )}
                                                    />
                                                </div>
                                                <div className={clsx(kcProps.kcSelectAuthListItemBodyClass)}>
                                                    <div
                                                        id="kc-webauthn-authenticator-label"
                                                        className={clsx(kcProps.kcSelectAuthListItemHeadingClass)}
                                                    >
                                                        {authenticator.label}
                                                    </div>

                                                    {authenticator.transports && authenticator.transports.displayNameProperties.length && (
                                                        <div
                                                            id="kc-webauthn-authenticator-transport"
                                                            className={clsx(kcProps.kcSelectAuthListItemDescriptionClass)}
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

                                                    <div className={clsx(kcProps.kcSelectAuthListItemDescriptionClass)}>
                                                        <span id="kc-webauthn-authenticator-created-label">{msg("webauthn-createdAt-label")}</span>
                                                        <span id="kc-webauthn-authenticator-created">{authenticator.createdAt}</span>
                                                    </div>
                                                </div>
                                                <div className={clsx(kcProps.kcSelectAuthListItemFillClass)} />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ))()}
                        <div id="kc-form-buttons" className={clsx(kcProps.kcFormButtonsClass)}>
                            <input
                                id="authenticateWebAuthnButton"
                                type="button"
                                onClick={webAuthnAuthenticate}
                                autoFocus={true}
                                value={msgStr("webauthn-doAuthenticate")}
                                className={clsx(
                                    kcProps.kcButtonClass,
                                    kcProps.kcButtonPrimaryClass,
                                    kcProps.kcButtonBlockClass,
                                    kcProps.kcButtonLargeClass
                                )}
                            />
                        </div>
                    </div>
                </div>
            }
        />
    );
}
