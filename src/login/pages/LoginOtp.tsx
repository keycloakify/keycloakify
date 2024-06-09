import { Fragment } from "react";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import { useI18n } from "../i18n";

export default function LoginOtp(props: PageProps<Extract<KcContext, { pageId: "login-otp.ftl" }>>) {
    const { kcContext, doUseDefaultCss, Template, classes } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { otpLogin, url, messagesPerField } = kcContext;

    const { msg, msgStr } = useI18n({ kcContext });

    return (
        <Template
            kcContext={kcContext}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={!messagesPerField.existsError("totp")}
            headerNode={msg("doLogIn")}
        >
            <form id="kc-otp-login-form" className={kcClsx("kcFormClass")} action={url.loginAction} method="post">
                {otpLogin.userOtpCredentials.length > 1 && (
                    <div className={kcClsx("kcFormGroupClass")}>
                        <div className={kcClsx("kcInputWrapperClass")}>
                            {otpLogin.userOtpCredentials.map((otpCredential, index) => (
                                <Fragment key={index}>
                                    <input
                                        id={`kc-otp-credential-${index}`}
                                        className={kcClsx("kcLoginOTPListInputClass")}
                                        type="radio"
                                        name="selectedCredentialId"
                                        value={otpCredential.id}
                                        defaultChecked={otpCredential.id === otpLogin.selectedCredentialId}
                                    />
                                    <label htmlFor={`kc-otp-credential-${index}`} className={kcClsx("kcLoginOTPListClass")} tabIndex={index}>
                                        <span className={kcClsx("kcLoginOTPListItemHeaderClass")}>
                                            <span className={kcClsx("kcLoginOTPListItemIconBodyClass")}>
                                                <i className={kcClsx("kcLoginOTPListItemIconClass")} aria-hidden="true"></i>
                                            </span>
                                            <span className={kcClsx("kcLoginOTPListItemTitleClass")}>{otpCredential.userLabel}</span>
                                        </span>
                                    </label>
                                </Fragment>
                            ))}
                        </div>
                    </div>
                )}

                <div className={kcClsx("kcFormGroupClass")}>
                    <div className={kcClsx("kcLabelWrapperClass")}>
                        <label htmlFor="otp" className={kcClsx("kcLabelClass")}>
                            {msg("loginOtpOneTime")}
                        </label>
                    </div>
                    <div className={kcClsx("kcInputWrapperClass")}>
                        <input
                            id="otp"
                            name="otp"
                            autoComplete="off"
                            type="text"
                            className={kcClsx("kcInputClass")}
                            autoFocus
                            aria-invalid={messagesPerField.existsError("totp")}
                        />
                        {messagesPerField.existsError("totp") && (
                            <span id="input-error-otp-code" className={kcClsx("kcInputErrorMessageClass")} aria-live="polite">
                                {messagesPerField.get("totp")}
                            </span>
                        )}
                    </div>
                </div>

                <div className={kcClsx("kcFormGroupClass")}>
                    <div id="kc-form-options" className={kcClsx("kcFormOptionsClass")}>
                        <div className={kcClsx("kcFormOptionsWrapperClass")}></div>
                    </div>
                    <div id="kc-form-buttons" className={kcClsx("kcFormButtonsClass")}>
                        <input
                            className={kcClsx("kcButtonClass", "kcButtonPrimaryClass", "kcButtonBlockClass", "kcButtonLargeClass")}
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
