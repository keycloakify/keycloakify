import { Fragment } from "react";
import { clsx } from "keycloakify/tools/clsx";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function LoginResetOtp(props: PageProps<Extract<KcContext, { pageId: "login-reset-otp.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    const { url, messagesPerField, configuredOtpCredentials } = kcContext;

    const { msg, msgStr } = i18n;

    return (
        <Template
            {...{ kcContext, i18n, doUseDefaultCss, classes }}
            displayMessage={!messagesPerField.existsError("totp")}
            headerNode={msg("doLogIn")}
        >
            <form id="kc-otp-reset-form" className={getClassName("kcFormClass")} action={url.loginAction} method="post">
                <div className={getClassName("kcInputWrapperClass")}>
                    <div className={getClassName("kcInfoAreaWrapperClass")}>
                        <p id="kc-otp-reset-form-description">{msg("otp-reset-description")}</p>
                        {configuredOtpCredentials.userOtpCredentials.map((otpCredential, index) => (
                            <Fragment key={otpCredential.id}>
                                <input
                                    id={`kc-otp-credential-${index}`}
                                    className={getClassName("kcLoginOTPListInputClass")}
                                    type="radio"
                                    name="selectedCredentialId"
                                    value={otpCredential.id}
                                    defaultChecked={otpCredential.id === configuredOtpCredentials.selectedCredentialId}
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
                        <div className={getClassName("kcFormGroupClass")}>
                            <div id="kc-form-buttons" className={getClassName("kcFormButtonsClass")}>
                                <input
                                    id="kc-otp-reset-form-submit"
                                    className={clsx(
                                        getClassName("kcButtonClass"),
                                        getClassName("kcButtonPrimaryClass"),
                                        getClassName("kcButtonBlockClass"),
                                        getClassName("kcButtonLargeClass")
                                    )}
                                    type="submit"
                                    value={msgStr("doSubmit")}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </Template>
    );
}
