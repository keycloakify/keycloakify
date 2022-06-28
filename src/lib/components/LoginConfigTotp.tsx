import { memo } from "react";
import { Template } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { getMsg } from "../i18n";
import { useCssAndCx } from "tss-react";

export const LoginConfigTotp = memo(({ kcContext, ...props }: { kcContext: KcContextBase.LoginConfigTotp } & KcProps) => {
    const { url, isAppInitiatedAction, totp, mode, messagesPerField } = kcContext;

    const { cx } = useCssAndCx();

    const { msg, msgStr } = getMsg(kcContext);
    const algToKeyUriAlg: Record<KcContextBase.LoginConfigTotp["totp"]["policy"]["algorithm"], string> = {
        HmacSHA1: "SHA1",
        HmacSHA256: "SHA256",
        HmacSHA512: "SHA512",
    };

    return (
        <Template
            {...{ kcContext, ...props }}
            doFetchDefaultThemeResources={true}
            headerNode={msg("loginTotpTitle")}
            formNode={
                <>
                    <ol id="kc-totp-settings">
                        <li>
                            <p>{msg("loginTotpStep1")}</p>

                            <ul id="kc-totp-supported-apps">
                                {totp.policy.supportedApplications.map(app => (
                                    <li>{app}</li>
                                ))}
                            </ul>
                        </li>

                        {mode && mode == "manual" ? (
                            <>
                                <li>
                                    <p>{msg("loginTotpManualStep2")}</p>
                                    <p>
                                        <span id="kc-totp-secret-key">{totp.totpSecretEncoded}</span>
                                    </p>
                                    <p>
                                        <a href={totp.qrUrl} id="mode-barcode">
                                            {msg("loginTotpScanBarcode")}
                                        </a>
                                    </p>
                                </li>
                                <li>
                                    <p>{msg("loginTotpManualStep3")}</p>
                                    <p>
                                        <ul>
                                            <li id="kc-totp-type">
                                                {msg("loginTotpType")}: {msg(`loginTotp.${totp.policy.type}`)}
                                            </li>
                                            <li id="kc-totp-algorithm">
                                                {msg("loginTotpAlgorithm")}: {algToKeyUriAlg[totp.policy.algorithm]}
                                            </li>
                                            <li id="kc-totp-digits">
                                                {msg("loginTotpDigits")}: {totp.policy.digits}
                                            </li>
                                            {totp.policy.type === "totp" ? (
                                                <li id="kc-totp-period">
                                                    {msg("loginTotpInterval")}: {totp.policy.period}
                                                </li>
                                            ) : (
                                                <li id="kc-totp-counter">
                                                    {msg("loginTotpCounter")}: {totp.policy.initialCounter}
                                                </li>
                                            )}
                                        </ul>
                                    </p>
                                </li>
                            </>
                        ) : (
                            <li>
                                <p>{msg("loginTotpStep2")}</p>
                                <img id="kc-totp-secret-qr-code" src={`data:image/png;base64, ${totp.totpSecretQrCode}`} alt="Figure: Barcode" />
                                <br />
                                <p>
                                    <a href={totp.manualUrl} id="mode-manual">
                                        {msg("loginTotpUnableToScan")}
                                    </a>
                                </p>
                            </li>
                        )}
                        <li>
                            <p>{msg("loginTotpStep3")}</p>
                            <p>{msg("loginTotpStep3DeviceName")}</p>
                        </li>
                    </ol>

                    <form action={url.loginAction} className={cx(props.kcFormClass)} id="kc-totp-settings-form" method="post">
                        <div className={cx(props.kcFormGroupClass)}>
                            <div className={cx(props.kcInputWrapperClass)}>
                                <label htmlFor="totp" className={cx(props.kcLabelClass)}>
                                    {msg("authenticatorCode")}
                                </label>{" "}
                                <span className="required">*</span>
                            </div>
                            <div className={cx(props.kcInputWrapperClass)}>
                                <input
                                    type="text"
                                    id="totp"
                                    name="totp"
                                    autoComplete="off"
                                    className={cx(props.kcInputClass)}
                                    aria-invalid={messagesPerField.existsError("totp")}
                                />

                                {messagesPerField.existsError("totp") && (
                                    <span id="input-error-otp-code" className={cx(props.kcInputErrorMessageClass)} aria-live="polite">
                                        {messagesPerField.get("totp")}
                                    </span>
                                )}
                            </div>
                            <input type="hidden" id="totpSecret" name="totpSecret" value={totp.totpSecret} />
                            {mode && <input type="hidden" id="mode" value={mode} />}
                        </div>

                        <div className={cx(props.kcFormGroupClass)}>
                            <div className={cx(props.kcInputWrapperClass)}>
                                <label htmlFor="userLabel" className={cx(props.kcLabelClass)}>
                                    {msg("loginTotpDeviceName")}
                                </label>{" "}
                                {totp.otpCredentials.length >= 1 && <span className="required">*</span>}
                            </div>
                            <div className={cx(props.kcInputWrapperClass)}>
                                <input
                                    type="text"
                                    id="userLabel"
                                    name="userLabel"
                                    autoComplete="off"
                                    className={cx(props.kcInputClass)}
                                    aria-invalid={messagesPerField.existsError("userLabel")}
                                />
                                {messagesPerField.existsError("userLabel") && (
                                    <span id="input-error-otp-label" className={cx(props.kcInputErrorMessageClass)} aria-live="polite">
                                        {messagesPerField.get("userLabel")}
                                    </span>
                                )}
                            </div>
                        </div>

                        {isAppInitiatedAction ? (
                            <>
                                <input
                                    type="submit"
                                    className={cx(props.kcButtonClass, props.kcButtonPrimaryClass, props.kcButtonLargeClass)}
                                    id="saveTOTPBtn"
                                    value={msgStr("doSubmit")}
                                />
                                <button
                                    type="submit"
                                    className={cx(
                                        props.kcButtonClass,
                                        props.kcButtonDefaultClass,
                                        props.kcButtonLargeClass,
                                        props.kcButtonLargeClass,
                                    )}
                                    id="cancelTOTPBtn"
                                    name="cancel-aia"
                                    value="true"
                                >
                                    ${msg("doCancel")}
                                </button>
                            </>
                        ) : (
                            <input
                                type="submit"
                                className={cx(props.kcButtonClass, props.kcButtonPrimaryClass, props.kcButtonLargeClass)}
                                id="saveTOTPBtn"
                                value={msgStr("doSubmit")}
                            />
                        )}
                    </form>
                </>
            }
        />
    );
});
