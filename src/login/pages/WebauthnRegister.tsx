import { useEffect, useRef, useState } from "react";
import { clsx } from "keycloakify/tools/clsx";
import { base64url } from "rfc4648";
import { useConstCallback } from "keycloakify/tools/useConstCallback";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";
import { assert } from "tsafe/assert";
import { is } from "tsafe/is";
import { typeGuard } from "tsafe/typeGuard";

export default function WebauthnRegister(props: PageProps<Extract<KcContext, { pageId: "webauthn-register.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({ doUseDefaultCss, classes });

    const {
        url,
        attestationConveyancePrefrence,
        authenticatorAttachment,
        challenge,
        createTimeout,
        excludeCredentialsId,
        requireResidentKey,
        userid,
        username,
        signatureAlgorithms,
        userVerificationRequirement,
        rpEntityName,
        rpId,
        isSetRetry,
        isAppInitiatedAction
    } = kcContext;

    const { msg, msgStr } = i18n;

    const [clientDataJSON, setClientDataJSON] = useState("");
    const [attestationObject, setAttestationObject] = useState("");
    const [publicKeyCredentialId, setPublicKeyCredentialId] = useState("");
    const [authenticatorLabel, setAuthenticatorLabel] = useState("");
    const [transports, setTransports] = useState<string[] | string>("");
    const [error, setError] = useState("");

    const formElementRef = useRef<HTMLFormElement>(null);

    const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);

    const submitForm = async (): Promise<void> => {
        const formElement = formElementRef.current;

        if (formElement === null) {
            await new Promise(resolve => setTimeout(resolve, 100));
            return submitForm();
        }

        formElement.submit();
    };

    const registerSecurityKey = useConstCallback(async () => {
        // Check if WebAuthn is supported by this browser
        if (!window.PublicKeyCredential) {
            setError("WebAuthn is not supported in this browser.");
            if (formElementRef.current) {
                formElementRef.current.submit();
            }
            return;
        }

        let pubKeyCredParams: PublicKeyCredentialParameters[] = getPubKeyCredParams(signatureAlgorithms);
        let rp: { name: string; id?: string } = { name: rpEntityName, id: rpId };
        let publicKey: PublicKeyCredentialCreationOptions = {
            challenge: base64url.parse(challenge, { loose: true }),
            rp: rp,
            user: {
                id: base64url.parse(userid, { loose: true }),
                name: username,
                displayName: username
            },
            pubKeyCredParams: pubKeyCredParams as PublicKeyCredentialParameters[],
            attestation:
                attestationConveyancePrefrence !== "not specified" ? (attestationConveyancePrefrence as AttestationConveyancePreference) : undefined
        };
        let authenticatorSelection = {};
        let isAuthenticatorSelectionSet = false;

        if (authenticatorAttachment !== "not specified") {
            authenticatorSelection = { authenticatorAttachment: authenticatorAttachment };
            isAuthenticatorSelectionSet = true;
        }

        if (requireResidentKey !== "not specified") {
            if (requireResidentKey === "Yes") {
                authenticatorSelection = { ...authenticatorSelection, requireResidentKey: true };
            } else {
                authenticatorSelection = { ...authenticatorSelection, requireResidentKey: false };
            }
            isAuthenticatorSelectionSet = true;
        }

        if (userVerificationRequirement !== "not specified") {
            authenticatorSelection = { ...authenticatorSelection, userVerification: userVerificationRequirement };
            isAuthenticatorSelectionSet = true;
        }

        if (isAuthenticatorSelectionSet) {
            publicKey = { ...publicKey, authenticatorSelection: authenticatorSelection };
        }

        if (createTimeout !== 0) {
            publicKey = { ...publicKey, timeout: createTimeout * 1000 };
        }
        let excludeCredentials = getExcludeCredentials(excludeCredentialsId);
        if (excludeCredentials && excludeCredentials.length !== 0) {
            publicKey = { ...publicKey, excludeCredentials: excludeCredentials };
        }
        try {
            const result = await navigator.credentials.create({ publicKey });

            if (!result || result.type !== "public-key") {
                return;
            }
            assert(is<PublicKeyCredential>(result));

            const response: AuthenticatorAttestationResponse = result.response as unknown as AuthenticatorAttestationResponse;

            const clientDataJSON = response.clientDataJSON;
            const attestationObject = response.attestationObject;

            assert(
                typeGuard<AuthenticatorAttestationResponse>(response, response.attestationObject instanceof ArrayBuffer),
                "response not an AuthenticatorAttestationResponse"
            );

            setClientDataJSON(base64url.stringify(new Uint8Array(clientDataJSON), { "pad": false }));
            setAttestationObject(base64url.stringify(new Uint8Array(attestationObject), { pad: false }));
            setPublicKeyCredentialId(base64url.stringify(new Uint8Array(result.rawId), { pad: false }));

            if (typeof response.getTransports === "function") {
                let transports = response.getTransports();
                if (transports) {
                    setTransports(getTransportsAsString(transports));
                }
            } else {
                console.log("Your browser is not able to recognize supported transport media for the authenticator.");
            }

            let initialLabel = "WebAuthn Authenticator (Default Label)";
            let labelResult = window.prompt("Please enter a label for your WebAuthn authenticator", initialLabel);
            if (labelResult !== null && labelResult !== "") {
                setAuthenticatorLabel(labelResult);
            }
        } catch (err) {
            setError(String(err));
            setIsReadyToSubmit(true);
        }
        setIsReadyToSubmit(true);
    });

    const getPubKeyCredParams = (sigAlgList: number[]): PublicKeyCredentialParameters[] => {
        let pubKeyCredParams: PublicKeyCredentialParameters[] = [];
        if (signatureAlgorithms.length === 0) {
            let alg: COSEAlgorithmIdentifier = -7;
            let type: PublicKeyCredentialType = "public-key";
            let object: PublicKeyCredentialParameters = { type, alg };
            pubKeyCredParams.push(object);
            return pubKeyCredParams;
        }
        for (let sigAlg of sigAlgList) {
            pubKeyCredParams.push({ type: "public-key", alg: sigAlg });
        }
        return pubKeyCredParams;
    };

    const getExcludeCredentials = (excludeCredentialIds: string) => {
        let excludeCredentials: PublicKeyCredentialDescriptor[] = [];
        if (!excludeCredentialIds) {
            return excludeCredentials;
        }
        let excludeCredentialIdsList = excludeCredentialIds.split(",");
        for (let excludeCredentialId of excludeCredentialIdsList) {
            excludeCredentials.push({ type: "public-key", id: base64url.parse(excludeCredentialId, { loose: true }) });
        }
    };

    const getTransportsAsString = (transportsList: string | string[]): string => {
        if (transportsList === "" || transportsList.constructor !== Array) return "";

        let transportsString = "";

        for (let i = 0; i < transportsList.length; i++) {
            transportsString += transportsList[i] + ",";
        }

        return transportsString.slice(0, -1);
    };

    useEffect(() => {
        if (isReadyToSubmit) {
            submitForm();
            setIsReadyToSubmit(false); // Reset the flag after submission
        }
    }, [isReadyToSubmit]);

    return (
        <Template
            {...{ kcContext, i18n, doUseDefaultCss, classes }}
            headerNode={
                <>
                    <span className={getClassName("kcWebAuthnDefaultIcon")} style={{ marginRight: "5px" }}></span>
                    {msg("webauthn-registration-title")}
                </>
            }
        >
            <div id="kc-form-webauthn" className={getClassName("kcFormClass")}>
                <form
                    id="kc-webauthn-settings-form"
                    action={url.loginAction}
                    ref={formElementRef}
                    method="post"
                    className={getClassName("kcFormClass")}
                >
                    <input type="hidden" id="clientDataJSON" name="clientDataJSON" value={clientDataJSON} />
                    <input type="hidden" id="attestationObject" name="attestationObject" value={attestationObject} />
                    <input type="hidden" id="publicKeyCredentialId" name="publicKeyCredentialId" value={publicKeyCredentialId} />
                    <input type="hidden" id="authenticatorLabel" name="authenticatorLabel" value={authenticatorLabel} />
                    <input type="hidden" id="transports" name="transports" value={transports} />
                    <input type="hidden" id="error" name="error" value={error} />
                </form>
                <input
                    type="button"
                    onClick={registerSecurityKey}
                    value={msgStr("doRegister")}
                    id="registerWebAuthn"
                    className={clsx(
                        getClassName("kcButtonClass"),
                        getClassName("kcButtonPrimaryClass"),
                        getClassName("kcButtonBlockClass"),
                        getClassName("kcButtonLargeClass")
                    )}
                />
                {!isSetRetry && isAppInitiatedAction && (
                    <form action={url.loginAction} className={getClassName("kcFormClass")}>
                        <button
                            type="submit"
                            className={`${getClassName("kcButtonClass")} ${getClassName("kcButtonDefaultClass")} ${getClassName(
                                "kcButtonBlockClass"
                            )} ${getClassName("kcButtonLargeClass")}`}
                            id="cancelWebAuthnAIA"
                            name="cancel-aia"
                            value="true"
                        >
                            {msg("doCancel")}
                        </button>
                    </form>
                )}
            </div>
        </Template>
    );
}
