import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/account/pages/PageProps";
import { useGetClassName } from "keycloakify/account/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";
import { MessageKey } from "keycloakify/account/i18n/i18n";

export default function Totp(props: PageProps<Extract<KcContext, { pageId: "totp.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    const { totp, mode, messagesPerField } = kcContext;

    const { msg, msgStr } = i18n;

    const algToKeyUriAlg: Record<(typeof kcContext)["totp"]["policy"]["algorithm"], string> = {
        "HmacSHA1": "SHA1",
        "HmacSHA256": "SHA256",
        "HmacSHA512": "SHA512"
    };

    return (
        <Template {...{ kcContext, i18n, doUseDefaultCss, classes }} active="totp">
            <>
                <div className="row">
                    <div className="col-md-10">
                        <h2>{msg("changePasswordHtmlTitle")}</h2>
                    </div>
                    <div className="col-md-2 subtitle">
                        <span className="subtitle">{msg("allFieldsRequired")}</span>
                    </div>
                </div>
                <ol id="kc-totp-settings">
                    <li>
                        <p>{msg("totpStep1")}</p>

                        <ul id="kc-totp-supported-apps">
                            {totp.supportedApplications.map(app => (
                                <li key={app}>{msg(app as MessageKey)}</li>
                            ))}
                        </ul>
                    </li>

                    {mode && mode == "manual" ? (
                        <>
                            <li>
                                <p>{msg("totpManualStep2")}</p>
                                <p>
                                    <span id="kc-totp-secret-key">{totp.totpSecretEncoded}</span>
                                </p>
                                <p>
                                    <a href={totp.qrUrl} id="mode-barcode">
                                        {msg("totpScanBarcode")}
                                    </a>
                                </p>
                            </li>
                            <li>
                                <p>{msg("totpManualStep3")}</p>
                                <p>
                                    <ul>
                                        <li id="kc-totp-type">
                                            {msg("totpType")}: {msg(`totp.${totp.policy.type}`)}
                                        </li>
                                        <li id="kc-totp-algorithm">
                                            {msg("totpAlgorithm")}: {algToKeyUriAlg?.[totp.policy.algorithm] ?? totp.policy.algorithm}
                                        </li>
                                        <li id="kc-totp-digits">
                                            {msg("totpDigits")}: {totp.policy.digits}
                                        </li>
                                        {totp.policy.type === "totp" ? (
                                            <li id="kc-totp-period">
                                                {msg("totpInterval")}: {totp.policy.period}
                                            </li>
                                        ) : (
                                            <li id="kc-totp-counter">
                                                {msg("totpCounter")}: {totp.policy.initialCounter}
                                            </li>
                                        )}
                                    </ul>
                                </p>
                            </li>
                        </>
                    ) : (
                        <li>
                            <p>{msg("totpStep2")}</p>
                            <img id="kc-totp-secret-qr-code" src={`data:image/png;base64, ${totp.totpSecretQrCode}`} alt="Figure: Barcode" />
                            <br />
                            <p>
                                <a href={totp.manualUrl} id="mode-manual">
                                    {msg("totpUnableToScan")}
                                </a>
                            </p>
                        </li>
                    )}
                    <li>
                        <p>{msg("totpStep3")}</p>
                        <p>{msg("totpStep3DeviceName")}</p>
                    </li>
                </ol>
                {/* <form action={url.loginAction} className={getClassName("kcFormClass")} id="kc-totp-settings-form" method="post"> */}

                <form className={getClassName("kcFormClass")} id="kc-totp-settings-form" method="post">
                    <div className={getClassName("kcFormGroupClass")}>
                        <div className="col-sm-2 col-md-2">
                            <label htmlFor="totp" className="control-label">
                                {msg("authenticatorCode")}
                            </label>{" "}
                            <span className="required">*</span>
                        </div>
                        <div className="col-sm-10 col-md-10">
                            <input
                                type="text"
                                id="totp"
                                name="totp"
                                autoComplete="off"
                                className={getClassName("kcInputClass")}
                                aria-invalid={messagesPerField.existsError("totp")}
                            />

                            {messagesPerField.existsError("totp") && (
                                <span id="input-error-otp-code" className={getClassName("kcInputErrorMessageClass")} aria-live="polite">
                                    {messagesPerField.get("totp")}
                                </span>
                            )}
                        </div>
                        <input type="hidden" id="totpSecret" name="totpSecret" value={totp.totpSecret} />
                        {mode && <input type="hidden" id="mode" value={mode} />}
                    </div>

                    <div className={getClassName("kcFormGroupClass")}>
                        <div className="col-sm-2 col-md-2">
                            <label htmlFor="userLabel" className={getClassName("kcLabelClass")}>
                                {msg("totpDeviceName")}
                            </label>{" "}
                            {totp.otpCredentials.length >= 1 && <span className="required">*</span>}
                        </div>
                        <div className="col-sm-10 col-md-10">
                            <input
                                type="text"
                                id="userLabel"
                                name="userLabel"
                                autoComplete="off"
                                className={getClassName("kcInputClass")}
                                aria-invalid={messagesPerField.existsError("userLabel")}
                            />
                            {messagesPerField.existsError("userLabel") && (
                                <span id="input-error-otp-label" className={getClassName("kcInputErrorMessageClass")} aria-live="polite">
                                    {messagesPerField.get("userLabel")}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="text-right kcFormGroupClass">
                        <input
                            type="submit"
                            className={clsx(getClassName("kcButtonClass"), getClassName("kcButtonPrimaryClass"), getClassName("kcButtonLargeClass"))}
                            id="saveTOTPBtn"
                            value={msgStr("doSave")}
                        />
                        <button
                            type="submit"
                            className={clsx(
                                getClassName("kcButtonClass"),
                                getClassName("kcButtonDefaultClass"),
                                getClassName("kcButtonLargeClass"),
                                getClassName("kcButtonLargeClass")
                            )}
                            id="cancelTOTPBtn"
                            name="cancel-aia"
                            value="true"
                        >
                            {msg("doCancel")}
                        </button>
                    </div>
                </form>
            </>
        </Template>
    );
}
