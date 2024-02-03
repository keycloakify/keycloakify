import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";

export default function LoginOtp(props: PageProps<Extract<KcContext, { pageId: "login-otp.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    const { otpLogin, url } = kcContext;

    const { msg, msgStr } = i18n;

    return (
        <>
            <style>
                {`
                input[type="radio"]:checked~label.kcSelectOTPListClass{
                    border: 2px solid #39a5dc;
                }`}
            </style>
            <Template {...{ kcContext, i18n, doUseDefaultCss, classes }} headerNode={msg("doLogIn")}>
                <form id="kc-otp-login-form" className={getClassName("kcFormClass")} action={url.loginAction} method="post">
                    {otpLogin.userOtpCredentials.length > 1 && (
                        <div className={getClassName("kcFormGroupClass")}>
                            <div className={getClassName("kcInputWrapperClass")}>
                                {otpLogin.userOtpCredentials.map((otpCredential, index) => (
                                    <div key={otpCredential.id}>
                                        <input
                                            id={`kc-otp-credential-${index}`}
                                            name="selectedCredentialId"
                                            type="radio"
                                            value={otpCredential.id}
                                            style={{ display: "none" }}
                                        />
                                        <label
                                            htmlFor={`kc-otp-credential-${index}`}
                                            key={otpCredential.id}
                                            className={getClassName("kcSelectOTPListClass")}
                                        >
                                            <div className={getClassName("kcSelectOTPListItemClass")}>
                                                <span className={getClassName("kcAuthenticatorOtpCircleClass")} />
                                                <h2 className={getClassName("kcSelectOTPItemHeadingClass")}>{otpCredential.userLabel}</h2>
                                            </div>
                                        </label>
                                    </div>
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
                            <input id="otp" name="otp" autoComplete="off" type="text" className={getClassName("kcInputClass")} autoFocus />
                        </div>
                    </div>

                    <div className={getClassName("kcFormGroupClass")}>
                        <div id="kc-form-options" className={getClassName("kcFormOptionsClass")}>
                            <div className={getClassName("kcFormOptionsWrapperClass")} />
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
        </>
    );
}
