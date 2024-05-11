import { useEffect, useReducer } from "react";
import { clsx } from "keycloakify/tools/clsx";
import { assert } from "tsafe/assert";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";

export default function LoginUpdatePassword(props: PageProps<Extract<KcContext, { pageId: "login-update-password.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    const { msg, msgStr } = i18n;

    const { url, messagesPerField, isAppInitiatedAction } = kcContext;

    return (
        <Template
            {...{ kcContext, i18n, doUseDefaultCss, classes }}
            displayMessage={!messagesPerField.existsError("password", "password-confirm")}
            headerNode={msg("updatePasswordTitle")}
        >
            <form id="kc-passwd-update-form" className={getClassName("kcFormClass")} action={url.loginAction} method="post">
                <div className={getClassName("kcFormGroupClass")}>
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="password-new" className={getClassName("kcLabelClass")}>
                            {msg("passwordNew")}
                        </label>
                        <div className={getClassName("kcInputWrapperClass")}>
                            <PasswordWrapper {...{ getClassName, i18n }} passwordInputId="password-new">
                                <input
                                    type="password"
                                    id="password-new"
                                    name="password-new"
                                    className={getClassName("kcInputClass")}
                                    autoFocus
                                    autoComplete="new-password"
                                    aria-invalid={messagesPerField.existsError("password", "password-confirm")}
                                />
                            </PasswordWrapper>

                            {messagesPerField.existsError("password") && (
                                <span id="input-error-password" className={getClassName("kcInputErrorMessageClass")} aria-live="polite">
                                    {messagesPerField.get("password")}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className={getClassName("kcFormGroupClass")}>
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="password-confirm" className={getClassName("kcLabelClass")}>
                            {msg("passwordConfirm")}
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <PasswordWrapper {...{ getClassName, i18n }} passwordInputId="password-confirm">
                            <input
                                type="password"
                                id="password-confirm"
                                name="password-confirm"
                                className={getClassName("kcInputClass")}
                                autoFocus
                                autoComplete="new-password"
                                aria-invalid={messagesPerField.existsError("password", "password-confirm")}
                            />
                        </PasswordWrapper>

                        {messagesPerField.existsError("password-confirm") && (
                            <span id="input-error-password-confirm" className={getClassName("kcInputErrorMessageClass")} aria-live="polite">
                                {messagesPerField.get("password-confirm")}
                            </span>
                        )}
                    </div>

                    <div className={getClassName("kcFormGroupClass")}>
                        <LogoutOtherSessions {...{ getClassName, i18n }} />

                        <div id="kc-form-buttons" className={getClassName("kcFormButtonsClass")}>
                            <input
                                className={clsx(
                                    getClassName("kcButtonClass"),
                                    getClassName("kcButtonPrimaryClass"),
                                    isAppInitiatedAction && getClassName("kcButtonBlockClass"),
                                    getClassName("kcButtonLargeClass")
                                )}
                                type="submit"
                                value={msgStr("doSubmit")}
                            />
                            {isAppInitiatedAction && (
                                <button
                                    className={clsx(
                                        getClassName("kcButtonClass"),
                                        getClassName("kcButtonDefaultClass"),
                                        getClassName("kcButtonLargeClass")
                                    )}
                                    type="submit"
                                    name="cancel-aia"
                                    value="true"
                                >
                                    {msg("doCancel")}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </Template>
    );
}

function LogoutOtherSessions(props: { getClassName: ReturnType<typeof useGetClassName>["getClassName"]; i18n: I18n }) {
    const { getClassName, i18n } = props;

    const { msg } = i18n;

    return (
        <div id="kc-form-options" className={getClassName("kcFormOptionsClass")}>
            <div className={getClassName("kcFormOptionsWrapperClass")}>
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
