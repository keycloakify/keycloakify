import React, { memo } from "react";
import DefaultTemplate from "./Template";
import type { TemplateProps } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { useCssAndCx } from "../tools/useCssAndCx";
import type { I18n } from "../i18n";

export type LoginConfigTotpProps = KcProps & {
    kcContext: KcContextBase.LoginConfigTotp;
    i18n: I18n;
    doFetchDefaultThemeResources?: boolean;
    Template?: (props: TemplateProps) => JSX.Element | null;
};

const LoginConfigTotp = memo((props: LoginConfigTotpProps) => {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template = DefaultTemplate, ...kcProps } = props;

    const { url, isAppInitiatedAction, totp, mode, messagesPerField } = kcContext;

    const { cx } = useCssAndCx();

    const { msg, msgStr } = i18n;

    const algToKeyUriAlg: Record<KcContextBase.LoginConfigTotp["totp"]["policy"]["algorithm"], string> = {
        "HmacSHA1": "SHA1",
        "HmacSHA256": "SHA256",
        "HmacSHA512": "SHA512"
    };

    return (
        <Template
            {...{ kcContext, i18n, doFetchDefaultThemeResources, ...kcProps }}
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
                                                {msg("loginTotpAlgorithm")}: {algToKeyUriAlg?.[totp.policy.algorithm] ?? totp.policy.algorithm}
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

                    <form action={url.loginAction} className={cx(kcProps.kcFormClass)} id="kc-totp-settings-form" method="post">
                        <div className={cx(kcProps.kcFormGroupClass)}>
                            <div className={cx(kcProps.kcInputWrapperClass)}>
                                <label htmlFor="totp" className={cx(kcProps.kcLabelClass)}>
                                    {msg("authenticatorCode")}
                                </label>{" "}
                                <span className="required">*</span>
                            </div>
                            <div className={cx(kcProps.kcInputWrapperClass)}>
                                <input
                                    type="text"
                                    id="totp"
                                    name="totp"
                                    autoComplete="off"
                                    className={cx(kcProps.kcInputClass)}
                                    aria-invalid={messagesPerField.existsError("totp")}
                                />

                                {messagesPerField.existsError("totp") && (
                                    <span id="input-error-otp-code" className={cx(kcProps.kcInputErrorMessageClass)} aria-live="polite">
                                        {messagesPerField.get("totp")}
                                    </span>
                                )}
                            </div>
                            <input type="hidden" id="totpSecret" name="totpSecret" value={totp.totpSecret} />
                            {mode && <input type="hidden" id="mode" value={mode} />}
                        </div>

                        <div className={cx(kcProps.kcFormGroupClass)}>
                            <div className={cx(kcProps.kcInputWrapperClass)}>
                                <label htmlFor="userLabel" className={cx(kcProps.kcLabelClass)}>
                                    {msg("loginTotpDeviceName")}
                                </label>{" "}
                                {totp.otpCredentials.length >= 1 && <span className="required">*</span>}
                            </div>
                            <div className={cx(kcProps.kcInputWrapperClass)}>
                                <input
                                    type="text"
                                    id="userLabel"
                                    name="userLabel"
                                    autoComplete="off"
                                    className={cx(kcProps.kcInputClass)}
                                    aria-invalid={messagesPerField.existsError("userLabel")}
                                />
                                {messagesPerField.existsError("userLabel") && (
                                    <span id="input-error-otp-label" className={cx(kcProps.kcInputErrorMessageClass)} aria-live="polite">
                                        {messagesPerField.get("userLabel")}
                                    </span>
                                )}
                            </div>
                        </div>

                        {isAppInitiatedAction ? (
                            <>
                                <input
                                    type="submit"
                                    className={cx(kcProps.kcButtonClass, kcProps.kcButtonPrimaryClass, kcProps.kcButtonLargeClass)}
                                    id="saveTOTPBtn"
                                    value={msgStr("doSubmit")}
                                />
                                <button
                                    type="submit"
                                    className={cx(
                                        kcProps.kcButtonClass,
                                        kcProps.kcButtonDefaultClass,
                                        kcProps.kcButtonLargeClass,
                                        kcProps.kcButtonLargeClass
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
                                className={cx(kcProps.kcButtonClass, kcProps.kcButtonPrimaryClass, kcProps.kcButtonLargeClass)}
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

export default LoginConfigTotp;
