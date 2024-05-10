import { useEffect, Fragment } from "react";
import { clsx } from "keycloakify/tools/clsx";
import type { MessageKey } from "keycloakify/login/i18n/i18n";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import { assert } from "tsafe/assert";
import { createUseInsertScriptTags } from "keycloakify/tools/useInsertScriptTags";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";

const { useInsertScriptTags } = createUseInsertScriptTags();

export default function WebauthnAuthenticate(props: PageProps<Extract<KcContext, { pageId: "webauthn-authenticate.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({ doUseDefaultCss, classes });

    const {
        url,
        isUserIdentified,
        challenge,
        userVerification,
        rpId,
        createTimeout,
        messagesPerField,
        realm,
        registrationDisabled,
        authenticators,
        shouldDisplayAuthenticators
    } = kcContext;

    const { msg, msgStr } = i18n;

    const { insertScriptTags } = useInsertScriptTags({
        "scriptTags": [
            {
                "type": "text/javascript",
                "src": `${url.resourcesCommonPath}/node_modules/jquery/dist/jquery.min.js`
            },
            {
                "type": "text/javascript",
                "src": `${url.resourcesPath}/js/base64url.js`
            },
            {
                "type": "text/javascript",
                "textContent": `

                    function webAuthnAuthenticate() {
                        let isUserIdentified = ${isUserIdentified};
                        if (!isUserIdentified) {
                            doAuthenticate([]);
                            return;
                        }
                        checkAllowCredentials();
                    }

                    function checkAllowCredentials() {
                        let allowCredentials = [];
                        let authn_use = document.forms['authn_select'].authn_use_chk;
                    
                        if (authn_use !== undefined) {
                            if (authn_use.length === undefined) {
                                allowCredentials.push({
                                    id: base64url.decode(authn_use.value, {loose: true}),
                                    type: 'public-key',
                                });
                            } else {
                                for (let i = 0; i < authn_use.length; i++) {
                                    allowCredentials.push({
                                        id: base64url.decode(authn_use[i].value, {loose: true}),
                                        type: 'public-key',
                                    });
                                }
                            }
                        }
                        doAuthenticate(allowCredentials);
                    }


                    function doAuthenticate(allowCredentials) {
                    
                        // Check if WebAuthn is supported by this browser
                        if (!window.PublicKeyCredential) {
                            $("#error").val("${msgStr("webauthn-unsupported-browser-text")}");
                            $("#webauth").submit();
                            return;
                        }
                    
                        let challenge = "${challenge}";
                        let userVerification = "${userVerification}";
                        let rpId = "${rpId}";
                        let publicKey = {
                            rpId : rpId,
                            challenge: base64url.decode(challenge, { loose: true })
                        };
                    
                        let createTimeout = ${createTimeout};
                        if (createTimeout !== 0) publicKey.timeout = createTimeout * 1000;
                    
                        if (allowCredentials.length) {
                            publicKey.allowCredentials = allowCredentials;
                        }
                    
                        if (userVerification !== 'not specified') publicKey.userVerification = userVerification;
                    
                        navigator.credentials.get({publicKey})
                            .then((result) => {
                                window.result = result;
                            
                                let clientDataJSON = result.response.clientDataJSON;
                                let authenticatorData = result.response.authenticatorData;
                                let signature = result.response.signature;
                            
                                $("#clientDataJSON").val(base64url.encode(new Uint8Array(clientDataJSON), { pad: false }));
                                $("#authenticatorData").val(base64url.encode(new Uint8Array(authenticatorData), { pad: false }));
                                $("#signature").val(base64url.encode(new Uint8Array(signature), { pad: false }));
                                $("#credentialId").val(result.id);
                                if(result.response.userHandle) {
                                    $("#userHandle").val(base64url.encode(new Uint8Array(result.response.userHandle), { pad: false }));
                                }
                                $("#webauth").submit();
                            })
                            .catch((err) => {
                                $("#error").val(err);
                                $("#webauth").submit();
                            })
                        ;
                    }

                `
            }
        ]
    });

    useEffect(() => {
        insertScriptTags();
    }, []);

    return (
        <Template
            {...{ kcContext, i18n, doUseDefaultCss, classes }}
            displayMessage={!messagesPerField.existsError("username")}
            displayInfo={realm.password && realm.registrationAllowed && !registrationDisabled}
            infoNode={
                <div id="kc-registration">
                    <span>
                        {msg("noAccount")}{" "}
                        <a tabIndex={6} href={url.registrationUrl}>
                            {msg("doRegister")}
                        </a>
                    </span>
                </div>
            }
            headerNode={msg("webauthn-login-title")}
        >
            <div id="kc-form-webauthn" className={getClassName("kcFormClass")}>
                <form id="webauth" action={url.loginAction} method="post">
                    <input type="hidden" id="clientDataJSON" name="clientDataJSON" />
                    <input type="hidden" id="authenticatorData" name="authenticatorData" />
                    <input type="hidden" id="signature" name="signature" />
                    <input type="hidden" id="credentialId" name="credentialId" />
                    <input type="hidden" id="userHandle" name="userHandle" />
                    <input type="hidden" id="error" name="error" />
                </form>
                <div className={clsx(getClassName("kcFormGroupClass"), "no-bottom-margin")}>
                    {authenticators && (
                        <>
                            <form id="authn_select" className={getClassName("kcFormClass")}>
                                {authenticators.authenticators.map(authenticator => (
                                    <input type="hidden" name="authn_use_chk" value={authenticator.credentialId} />
                                ))}
                            </form>

                            {shouldDisplayAuthenticators && (
                                <>
                                    {authenticators.authenticators.length > 1 && (
                                        <p className={getClassName("kcSelectAuthListItemTitle")}>{msg("webauthn-available-authenticators")}</p>
                                    )}
                                    <div className={getClassName("kcFormOptionsClass")}>
                                        {authenticators.authenticators.map((authenticator, i) => (
                                            <div key={i} id="kc-webauthn-authenticator" className={getClassName("kcSelectAuthListItemClass")}>
                                                <div className={getClassName("kcSelectAuthListItemIconClass")}>
                                                    <i
                                                        className={clsx(
                                                            (() => {
                                                                const className = getClassName(authenticator.transports.iconClass as any);
                                                                if (className === authenticator.transports.iconClass) {
                                                                    return getClassName("kcWebAuthnDefaultIcon");
                                                                }
                                                                return className;
                                                            })(),
                                                            getClassName("kcSelectAuthListItemIconPropertyClass")
                                                        )}
                                                    />
                                                </div>
                                                <div className={getClassName("kcSelectAuthListItemArrowIconClass")}>
                                                    <div
                                                        id="kc-webauthn-authenticator-label"
                                                        className={getClassName("kcSelectAuthListItemHeadingClass")}
                                                    >
                                                        {msg(authenticator.label as MessageKey)}
                                                    </div>
                                                    {authenticator.transports.displayNameProperties?.length && (
                                                        <div
                                                            id="kc-webauthn-authenticator-transport"
                                                            className={getClassName("kcSelectAuthListItemDescriptionClass")}
                                                        >
                                                            {authenticator.transports.displayNameProperties
                                                                .map((nameProperty, i, arr) => ({ nameProperty, "hasNext": i !== arr.length - 1 }))
                                                                .map(({ nameProperty, hasNext }) => (
                                                                    <Fragment key={nameProperty}>
                                                                        <span>{msg(nameProperty)}</span>
                                                                        {hasNext && <span>, </span>}
                                                                    </Fragment>
                                                                ))}
                                                        </div>
                                                    )}
                                                    <div className={getClassName("kcSelectAuthListItemDescriptionClass")}>
                                                        <span id="kc-webauthn-authenticator-created-label">{msg("webauthn-createdAt-label")}</span>
                                                        <span id="kc-webauthn-authenticator-created">{authenticator.createdAt}</span>
                                                    </div>
                                                    <div className={getClassName("kcSelectAuthListItemFillClass")} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    <div id="kc-form-buttons" className={getClassName("kcFormButtonsClass")}>
                        <input
                            id="authenticateWebAuthnButton"
                            type="button"
                            onClick={() => {
                                assert("webAuthnAuthenticate" in window);
                                assert(window.webAuthnAuthenticate instanceof Function);
                                window.webAuthnAuthenticate();
                            }}
                            autoFocus
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
