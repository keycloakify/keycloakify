import { useEffect } from "react";
import { assert } from "keycloakify/tools/assert";
import { getKcClsx, type KcClsx } from "keycloakify/login/lib/kcClsx";
import { useInsertScriptTags } from "keycloakify/tools/useInsertScriptTags";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function WebauthnRegister(props: PageProps<Extract<KcContext, { pageId: "webauthn-register.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { kcClsx } = getKcClsx({ doUseDefaultCss, classes });

    const {
        url,
        challenge,
        userid,
        username,
        signatureAlgorithms,
        rpEntityName,
        rpId,
        attestationConveyancePreference,
        authenticatorAttachment,
        requireResidentKey,
        userVerificationRequirement,
        createTimeout,
        excludeCredentialIds,
        isSetRetry,
        isAppInitiatedAction
    } = kcContext;

    const { msg, msgStr } = i18n;

    const { insertScriptTags } = useInsertScriptTags({
        componentOrHookName: "WebauthnRegister",
        scriptTags: [
            {
                type: "text/javascript",
                src: `${url.resourcesCommonPath}/node_modules/jquery/dist/jquery.min.js`
            },
            {
                type: "text/javascript",
                src: `${url.resourcesPath}/js/base64url.js`
            },
            {
                type: "text/javascript",
                textContent: `
                function registerSecurityKey() {

                    // Check if WebAuthn is supported by this browser
                    if (!window.PublicKeyCredential) {
                        $("#error").val("${msgStr("webauthn-unsupported-browser-text")}");
                        $("#register").submit();
                        return;
                    }
    
                    // mandatory parameters
                    let challenge = "${challenge}";
                    let userid = "${userid}";
                    let username = "${username}";
    
                    let signatureAlgorithms =${JSON.stringify(signatureAlgorithms)};
                    let pubKeyCredParams = getPubKeyCredParams(signatureAlgorithms);
    
                    let rpEntityName = "${rpEntityName}";
                    let rp = {name: rpEntityName};
    
                    let publicKey = {
                        challenge: base64url.decode(challenge, {loose: true}),
                        rp: rp,
                        user: {
                            id: base64url.decode(userid, {loose: true}),
                            name: username,
                            displayName: username
                        },
                        pubKeyCredParams: pubKeyCredParams,
                    };
    
                    // optional parameters
                    let rpId = "${rpId}";
                    publicKey.rp.id = rpId;
    
                    let attestationConveyancePreference = "${attestationConveyancePreference}";
                    if (attestationConveyancePreference !== 'not specified') publicKey.attestation = attestationConveyancePreference;
    
                    let authenticatorSelection = {};
                    let isAuthenticatorSelectionSpecified = false;
    
                    let authenticatorAttachment = "${authenticatorAttachment}";
                    if (authenticatorAttachment !== 'not specified') {
                        authenticatorSelection.authenticatorAttachment = authenticatorAttachment;
                        isAuthenticatorSelectionSpecified = true;
                    }
    
                    let requireResidentKey = "${requireResidentKey}";
                    if (requireResidentKey !== 'not specified') {
                        if (requireResidentKey === 'Yes')
                            authenticatorSelection.requireResidentKey = true;
                        else
                            authenticatorSelection.requireResidentKey = false;
                        isAuthenticatorSelectionSpecified = true;
                    }
    
                    let userVerificationRequirement = "${userVerificationRequirement}";
                    if (userVerificationRequirement !== 'not specified') {
                        authenticatorSelection.userVerification = userVerificationRequirement;
                        isAuthenticatorSelectionSpecified = true;
                    }
    
                    if (isAuthenticatorSelectionSpecified) publicKey.authenticatorSelection = authenticatorSelection;
    
                    let createTimeout = ${createTimeout};
                    if (createTimeout !== 0) publicKey.timeout = createTimeout * 1000;
    
                    let excludeCredentialIds = "${excludeCredentialIds}";
                    let excludeCredentials = getExcludeCredentials(excludeCredentialIds);
                    if (excludeCredentials.length > 0) publicKey.excludeCredentials = excludeCredentials;
    
                    navigator.credentials.create({publicKey})
                        .then(function (result) {
                            window.result = result;
                            let clientDataJSON = result.response.clientDataJSON;
                            let attestationObject = result.response.attestationObject;
                            let publicKeyCredentialId = result.rawId;
    
                            $("#clientDataJSON").val(base64url.encode(new Uint8Array(clientDataJSON), {pad: false}));
                            $("#attestationObject").val(base64url.encode(new Uint8Array(attestationObject), {pad: false}));
                            $("#publicKeyCredentialId").val(base64url.encode(new Uint8Array(publicKeyCredentialId), {pad: false}));
    
                            if (typeof result.response.getTransports === "function") {
                                let transports = result.response.getTransports();
                                if (transports) {
                                    $("#transports").val(getTransportsAsString(transports));
                                }
                            } else {
                                console.log("Your browser is not able to recognize supported transport media for the authenticator.");
                            }
    
                            let initLabel = "WebAuthn Authenticator (Default Label)";
                            let labelResult = window.prompt("Please input your registered authenticator's label", initLabel);
                            if (labelResult === null) labelResult = initLabel;
                            $("#authenticatorLabel").val(labelResult);
    
                            $("#register").submit();
    
                        })
                        .catch(function (err) {
                            $("#error").val(err);
                            $("#register").submit();
    
                        });
                }
    
                function getPubKeyCredParams(signatureAlgorithmsList) {
                    let pubKeyCredParams = [];
                    if (signatureAlgorithmsList.length === 0) {
                        pubKeyCredParams.push({type: "public-key", alg: -7});
                        return pubKeyCredParams;
                    }
    
                    for (let i = 0; i < signatureAlgorithmsList.length; i++) {
                        pubKeyCredParams.push({
                            type: "public-key",
                            alg: signatureAlgorithmsList[i]
                        });
                    }
                    return pubKeyCredParams;
                }
    
                function getExcludeCredentials(excludeCredentialIds) {
                    let excludeCredentials = [];
                    if (excludeCredentialIds === "") return excludeCredentials;
    
                    let excludeCredentialIdsList = excludeCredentialIds.split(',');
    
                    for (let i = 0; i < excludeCredentialIdsList.length; i++) {
                        excludeCredentials.push({
                            type: "public-key",
                            id: base64url.decode(excludeCredentialIdsList[i],
                            {loose: true})
                        });
                    }
                    return excludeCredentials;
                }
    
                function getTransportsAsString(transportsList) {
                    if (transportsList === '' || Array.isArray(transportsList)) return "";
    
                    let transportsString = "";
    
                    for (let i = 0; i < transportsList.length; i++) {
                        transportsString += transportsList[i] + ",";
                    }
    
                    return transportsString.slice(0, -1);
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
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            headerNode={
                <>
                    <span className={kcClsx("kcWebAuthnKeyIcon")} />
                    {msg("webauthn-registration-title")}
                </>
            }
        >
            <form id="register" className={kcClsx("kcFormClass")} action={url.loginAction} method="post">
                <div className={kcClsx("kcFormGroupClass")}>
                    <input type="hidden" id="clientDataJSON" name="clientDataJSON" />
                    <input type="hidden" id="attestationObject" name="attestationObject" />
                    <input type="hidden" id="publicKeyCredentialId" name="publicKeyCredentialId" />
                    <input type="hidden" id="authenticatorLabel" name="authenticatorLabel" />
                    <input type="hidden" id="transports" name="transports" />
                    <input type="hidden" id="error" name="error" />
                    <LogoutOtherSessions kcClsx={kcClsx} i18n={i18n} />
                </div>
            </form>
            <input
                type="submit"
                className={kcClsx("kcButtonClass", "kcButtonPrimaryClass", "kcButtonBlockClass", "kcButtonLargeClass")}
                id="registerWebAuthn"
                value={msgStr("doRegisterSecurityKey")}
                onClick={() => {
                    assert("registerSecurityKey" in window);
                    assert(typeof window.registerSecurityKey === "function");
                    window.registerSecurityKey();
                }}
            />

            {!isSetRetry && isAppInitiatedAction && (
                <form action={url.loginAction} className={kcClsx("kcFormClass")} id="kc-webauthn-settings-form" method="post">
                    <button
                        type="submit"
                        className={kcClsx("kcButtonClass", "kcButtonDefaultClass", "kcButtonBlockClass", "kcButtonLargeClass")}
                        id="cancelWebAuthnAIA"
                        name="cancel-aia"
                        value="true"
                    >
                        {msg("doCancel")}
                    </button>
                </form>
            )}
        </Template>
    );
}

function LogoutOtherSessions(props: { kcClsx: KcClsx; i18n: I18n }) {
    const { kcClsx, i18n } = props;

    const { msg } = i18n;

    return (
        <div id="kc-form-options" className={kcClsx("kcFormOptionsClass")}>
            <div className={kcClsx("kcFormOptionsWrapperClass")}>
                <div className="checkbox">
                    <label>
                        <input type="checkbox" id="logout-sessions" name="logout-sessions" value="on" defaultChecked={true} />
                        {msg("logoutOtherSessions")}
                    </label>
                </div>
            </div>
        </div>
    );
}
