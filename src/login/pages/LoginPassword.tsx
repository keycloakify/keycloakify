import { useState, useEffect, useReducer } from "react";
import { clsx } from "keycloakify/tools/clsx";
import { assert } from "tsafe/assert";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";

export default function LoginPassword(props: PageProps<Extract<KcContext, { pageId: "login-password.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    const { realm, url, messagesPerField } = kcContext;

    const { msg, msgStr } = i18n;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    return (
        <Template
            {...{ kcContext, i18n, doUseDefaultCss, classes }}
            headerNode={msg("doLogIn")}
            displayMessage={!messagesPerField.existsError("password")}
        >
            <div id="kc-form">
                <div id="kc-form-wrapper">
                    <form
                        id="kc-form-login"
                        onSubmit={() => {
                            setIsLoginButtonDisabled(true);
                            return true;
                        }}
                        action={url.loginAction}
                        method="post"
                    >
                        <div className={clsx(getClassName("kcFormGroupClass"), "no-bottom-margin")}>
                            <hr />
                            <label htmlFor="password" className={getClassName("kcLabelClass")}>
                                {msg("password")}
                            </label>

                            <PasswordWrapper getClassName={getClassName} i18n={i18n} passwordInputId="password">
                                <input
                                    tabIndex={2}
                                    id="password"
                                    className={getClassName("kcInputClass")}
                                    name="password"
                                    type="password"
                                    autoFocus
                                    autoComplete="on"
                                    aria-invalid={messagesPerField.existsError("username", "password")}
                                />
                            </PasswordWrapper>

                            {messagesPerField.existsError("password") && (
                                <span id="input-error-password" className={getClassName("kcInputErrorMessageClass")} aria-live="polite">
                                    {messagesPerField.get("password")}
                                </span>
                            )}
                        </div>
                        <div className={clsx(getClassName("kcFormGroupClass"), getClassName("kcFormSettingClass"))}>
                            <div id="kc-form-options" />
                            <div className={getClassName("kcFormOptionsWrapperClass")}>
                                {realm.resetPasswordAllowed && (
                                    <span>
                                        <a tabIndex={5} href={url.loginResetCredentialsUrl}>
                                            {msg("doForgotPassword")}
                                        </a>
                                    </span>
                                )}
                            </div>
                        </div>
                        <div id="kc-form-buttons" className={getClassName("kcFormGroupClass")}>
                            <input
                                tabIndex={4}
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
                                disabled={isLoginButtonDisabled}
                            />
                        </div>
                    </form>
                </div>
            </div>
        </Template>
    );
}

function PasswordWrapper(props: {
    getClassName: ReturnType<typeof useGetClassName>["getClassName"];
    i18n: I18n;
    passwordInputId: string;
    children: JSX.Element;
}) {
    const { getClassName, i18n, passwordInputId, children } = props;

    const { msgStr } = i18n;

    const [isPasswordRevealed, toggleIsPasswordRevealed] = useReducer((isPasswordRevealed: boolean) => !isPasswordRevealed, false);

    useEffect(() => {
        const passwordInputElement = document.getElementById(passwordInputId);

        assert(passwordInputElement instanceof HTMLInputElement);

        passwordInputElement.type = isPasswordRevealed ? "text" : "password";
    }, [isPasswordRevealed]);

    return (
        <div className={getClassName("kcInputGroup")}>
            {children}
            <button
                type="button"
                className={getClassName("kcFormPasswordVisibilityButtonClass")}
                aria-label={msgStr(isPasswordRevealed ? "hidePassword" : "showPassword")}
                aria-controls={passwordInputId}
                onClick={toggleIsPasswordRevealed}
            >
                <i
                    className={getClassName(isPasswordRevealed ? "kcFormPasswordVisibilityIconHide" : "kcFormPasswordVisibilityIconShow")}
                    aria-hidden
                />
            </button>
        </div>
    );
}
