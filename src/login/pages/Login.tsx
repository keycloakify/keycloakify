import { useState } from "react";
import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";

export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    const { social, realm, url, usernameHidden, login, auth, registrationDisabled, messagesPerField } = kcContext;

    const { msg, msgStr } = i18n;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    return (
        <Template
            {...{ kcContext, i18n, doUseDefaultCss, classes }}
            displayMessage={!messagesPerField.existsError("username", "password")}
            displayInfo={realm.password && realm.registrationAllowed && !registrationDisabled}
            headerNode={msg("loginAccountTitle")}
            infoNode={
                <div id="kc-registration-container">
                    <div id="kc-registration">
                        <span>
                            {msg("noAccount")}{" "}
                            <a tabIndex={8} href={url.registrationUrl}>
                                {msg("doRegister")}
                            </a>
                        </span>
                    </div>
                </div>
            }
            socialProvidersNode={
                realm.password &&
                social.providers && (
                    <div id="kc-social-providers" className={getClassName("kcFormSocialAccountSectionClass")}>
                        <hr />
                        <h2>{msg("identity-provider-login-label")}</h2>

                        <ul
                            className={clsx(
                                getClassName("kcFormSocialAccountListClass"),
                                social.providers.length > 3 && getClassName("kcFormSocialAccountListGridClass")
                            )}
                        >
                            {social.providers.map(p => (
                                <li key={p.alias}>
                                    <a
                                        id={`social-${p.alias}`}
                                        className={clsx(
                                            getClassName("kcFormSocialAccountListButtonClass"),
                                            social.providers!.length > 3 && getClassName("kcFormSocialAccountGridItem")
                                        )}
                                        type="button"
                                        href={p.loginUrl}
                                    >
                                        {p.iconClasses ? (
                                            <>
                                                <i className={clsx(getClassName("kcCommonLogoIdP"), p.iconClasses)} aria-hidden={true}></i>
                                                <span className={clsx(getClassName("kcFormSocialAccountNameClass"), "kc-social-icon-text")}>
                                                    {p.displayName}
                                                </span>
                                            </>
                                        ) : (
                                            <span className={getClassName("kcFormSocialAccountNameClass")}>{p.displayName}</span>
                                        )}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )
            }
        >
            <div id="kc-form">
                <div id="kc-form-wrapper">
                    {realm.password && (
                        <form
                            id="kc-form-login"
                            onSubmit={() => {
                                setIsLoginButtonDisabled(true);

                                return true;
                            }}
                            action={url.loginAction}
                            method="post"
                        >
                            {!usernameHidden && (
                                <div className={getClassName("kcFormGroupClass")}>
                                    <label htmlFor="username" className={getClassName("kcLabelClass")}>
                                        {!realm.loginWithEmailAllowed
                                            ? msg("username")
                                            : !realm.registrationEmailAsUsername
                                            ? msg("usernameOrEmail")
                                            : msg("email")}
                                    </label>

                                    <input
                                        tabIndex={2}
                                        id="username"
                                        className={getClassName("kcInputClass")}
                                        name="username"
                                        value={login.username ?? ""}
                                        type="text"
                                        autoFocus
                                        autoComplete="username"
                                        aria-invalid={messagesPerField.existsError("username", "password") ? true : undefined}
                                    />

                                    {messagesPerField.existsError("username", "password") && (
                                        <span id="input-error" className={getClassName("kcInputErrorMessageClass")} aria-live="polite">
                                            {messagesPerField.getFirstError("username", "password")}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className={getClassName("kcFormGroupClass")}>
                                <label htmlFor="password" className={getClassName("kcLabelClass")}>
                                    {msg("password")}
                                </label>

                                <div className={getClassName("kcInputGroup")}>
                                    <input
                                        tabIndex={3}
                                        id="password"
                                        className={getClassName("kcInputClass")}
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        aria-invalid={messagesPerField.existsError("username", "password") ? "true" : undefined}
                                    />
                                    <button
                                        className={getClassName("kcFormPasswordVisibilityButtonClass")}
                                        type="button"
                                        aria-label={msgStr("showPassword")}
                                        aria-controls="password"
                                        data-password-toggle
                                        tabIndex={4}
                                        data-icon-show={getClassName("kcFormPasswordVisibilityIconShow")}
                                        data-icon-hide={getClassName("kcFormPasswordVisibilityIconHide")}
                                        data-label-show={msg("showPassword")}
                                        data-label-hide={msg("hidePassword")}
                                    >
                                        <i className={getClassName("kcFormPasswordVisibilityIconShow")} aria-hidden={true}></i>
                                    </button>
                                </div>

                                {usernameHidden && messagesPerField.existsError("username", "password") && (
                                    <span id="input-error" className={getClassName("kcInputErrorMessageClass")} aria-live="polite">
                                        {messagesPerField.getFirstError("username", "password")}
                                    </span>
                                )}
                            </div>
                            <div className={clsx(getClassName("kcFormGroupClass"), getClassName("kcFormSettingClass"))}>
                                <div id="kc-form-options">
                                    {realm.rememberMe && !usernameHidden && (
                                        <div className="checkbox">
                                            <label>
                                                {login.rememberMe ? (
                                                    <input tabIndex={5} id="rememberMe" name="rememberMe" type="checkbox" defaultChecked />
                                                ) : (
                                                    <input tabIndex={5} id="rememberMe" name="rememberMe" type="checkbox" />
                                                )}
                                                {msg("rememberMe")}
                                            </label>
                                        </div>
                                    )}
                                </div>
                                <div className={getClassName("kcFormOptionsWrapperClass")}>
                                    {realm.resetPasswordAllowed && (
                                        <span>
                                            <a tabIndex={6} href={url.loginResetCredentialsUrl}>
                                                {msg("doForgotPassword")}
                                            </a>
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div id="kc-form-buttons" className={getClassName("kcFormGroupClass")}>
                                <input type="hidden" id="id-hidden-input" name="credentialId" value={auth.selectedCredential ?? ""} />
                                <input
                                    tabIndex={7}
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
                    )}
                </div>
            </div>
            <script type="module" src={`${url.resourcesPath}/js/passwordVisibility.js`} />
        </Template>
    );
}
