import { Fragment } from "react";
import { clsx } from "keycloakify/tools/clsx";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import { useI18n } from "../i18n";

export default function LoginOtp(props: PageProps<Extract<KcContext, { pageId: "login-otp.ftl" }>>) {
    const { kcContext, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    const { otpLogin, url, messagesPerField } = kcContext;

    const { msg, msgStr } = useI18n({ kcContext });

    return (
        <Template {...{ kcContext, doUseDefaultCss, classes }} displayMessage={!messagesPerField.existsError("totp")} headerNode={msg("doLogIn")}>
            <form id="kc-otp-login-form" className={clsx(getClassName("kcFormClass"))} action={url.loginAction} method="post">
                {otpLogin.userOtpCredentials.length > 1 && (
                    <div className={getClassName("kcFormGroupClass")}>
                        <div className={getClassName("kcInputWrapperClass")}>
                            {otpLogin.userOtpCredentials.map((otpCredential, index) => (
                                <Fragment key={index}>
                                    <input
                                        id={`kc-otp-credential-${index}`}
                                        className={getClassName("kcLoginOTPListInputClass")}
                                        type="radio"
                                        name="selectedCredentialId"
                                        value={otpCredential.id}
                                        defaultChecked={otpCredential.id === otpLogin.selectedCredentialId}
                                    />
                                    <label htmlFor={`kc-otp-credential-${index}`} className={getClassName("kcLoginOTPListClass")} tabIndex={index}>
                                        <span className={getClassName("kcLoginOTPListItemHeaderClass")}>
                                            <span className={getClassName("kcLoginOTPListItemIconBodyClass")}>
                                                <i className={getClassName("kcLoginOTPListItemIconClass")} aria-hidden="true"></i>
                                            </span>
                                            <span className={getClassName("kcLoginOTPListItemTitleClass")}>{otpCredential.userLabel}</span>
                                        </span>
                                    </label>
                                </Fragment>
                            ))}
                        </div>
                    </div>
                )}

                <div className={getClassName("kcFormGroupClass")}>
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="otp" className={getClassName("kcLabelClass")}>
                            {msg("loginOtpOneTime")}
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            id="otp"
                            name="otp"
                            autoComplete="off"
                            type="text"
                            className={getClassName("kcInputClass")}
                            autoFocus
                            aria-invalid={messagesPerField.existsError("totp")}
                        />
                        {messagesPerField.existsError("totp") && (
                            <span id="input-error-otp-code" className={getClassName("kcInputErrorMessageClass")} aria-live="polite">
                                {messagesPerField.get("totp")}
                            </span>
                        )}
                    </div>
                </div>

                <div className={getClassName("kcFormGroupClass")}>
                    <div id="kc-form-options" className={getClassName("kcFormOptionsClass")}>
                        <div className={getClassName("kcFormOptionsWrapperClass")}></div>
                    </div>
                    <div id="kc-form-buttons" className={getClassName("kcFormButtonsClass")}>
                        <input
                            className={clsx(
                                getClassName("kcButtonClass"),
                                getClassName("kcButtonPrimaryClass"),
                                getClassName("kcButtonBlockClass"),
                                getClassName("kcButtonLargeClass")
                            )}
                            name="login"
                            id="kc-login"
                            type="submit"
                            value={msgStr("doLogIn")}
                        />
                    </div>
                </div>
            </form>
        </Template>
    );
}
