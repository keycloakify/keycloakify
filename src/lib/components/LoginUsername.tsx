import React, { useState, memo } from "react";
import DefaultTemplate from "./Template";
import type { TemplateProps } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { useCssAndCx } from "../tools/useCssAndCx";
import { useConstCallback } from "powerhooks/useConstCallback";
import type { FormEventHandler } from "react";
import type { I18n } from "../i18n";

export type LoginUsernameProps = KcProps & {
    kcContext: KcContextBase.LoginUsername;
    i18n: I18n;
    doFetchDefaultThemeResources?: boolean;
    Template?: (props: TemplateProps) => JSX.Element | null;
};

const LoginUsername = memo((props: LoginUsernameProps) => {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template = DefaultTemplate, ...kcProps } = props;

    const { social, realm, url, usernameHidden, login, registrationDisabled } = kcContext;

    const { msg, msgStr } = i18n;

    const { cx } = useCssAndCx();

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    const onSubmit = useConstCallback<FormEventHandler<HTMLFormElement>>(e => {
        e.preventDefault();

        setIsLoginButtonDisabled(true);

        const formElement = e.target as HTMLFormElement;

        //NOTE: Even if we login with email Keycloak expect username and password in
        //the POST request.
        formElement.querySelector("input[name='email']")?.setAttribute("name", "username");

        formElement.submit();
    });

    return (
        <Template
            {...{ kcContext, i18n, doFetchDefaultThemeResources, ...kcProps }}
            displayInfo={social.displayInfo}
            displayWide={realm.password && social.providers !== undefined}
            headerNode={msg("doLogIn")}
            formNode={
                <div id="kc-form" className={cx(realm.password && social.providers !== undefined && kcProps.kcContentWrapperClass)}>
                    <div
                        id="kc-form-wrapper"
                        className={cx(
                            realm.password && social.providers && [kcProps.kcFormSocialAccountContentClass, kcProps.kcFormSocialAccountClass]
                        )}
                    >
                        {realm.password && (
                            <form id="kc-form-login" onSubmit={onSubmit} action={url.loginAction} method="post">
                                <div className={cx(kcProps.kcFormGroupClass)}>
                                    {!usernameHidden &&
                                        (() => {
                                            const label = !realm.loginWithEmailAllowed
                                                ? "username"
                                                : realm.registrationEmailAsUsername
                                                ? "email"
                                                : "usernameOrEmail";

                                            const autoCompleteHelper: typeof label = label === "usernameOrEmail" ? "username" : label;

                                            return (
                                                <>
                                                    <label htmlFor={autoCompleteHelper} className={cx(kcProps.kcLabelClass)}>
                                                        {msg(label)}
                                                    </label>
                                                    <input
                                                        tabIndex={1}
                                                        id={autoCompleteHelper}
                                                        className={cx(kcProps.kcInputClass)}
                                                        //NOTE: This is used by Google Chrome auto fill so we use it to tell
                                                        //the browser how to pre fill the form but before submit we put it back
                                                        //to username because it is what keycloak expects.
                                                        name={autoCompleteHelper}
                                                        defaultValue={login.username ?? ""}
                                                        type="text"
                                                        autoFocus={true}
                                                        autoComplete="off"
                                                    />
                                                </>
                                            );
                                        })()}
                                </div>
                                <div className={cx(kcProps.kcFormGroupClass, kcProps.kcFormSettingClass)}>
                                    <div id="kc-form-options">
                                        {realm.rememberMe && !usernameHidden && (
                                            <div className="checkbox">
                                                <label>
                                                    <input
                                                        tabIndex={3}
                                                        id="rememberMe"
                                                        name="rememberMe"
                                                        type="checkbox"
                                                        {...(login.rememberMe
                                                            ? {
                                                                  "checked": true
                                                              }
                                                            : {})}
                                                    />
                                                    {msg("rememberMe")}
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div id="kc-form-buttons" className={cx(kcProps.kcFormGroupClass)}>
                                    <input
                                        tabIndex={4}
                                        className={cx(
                                            kcProps.kcButtonClass,
                                            kcProps.kcButtonPrimaryClass,
                                            kcProps.kcButtonBlockClass,
                                            kcProps.kcButtonLargeClass
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
                    {realm.password && social.providers !== undefined && (
                        <div id="kc-social-providers" className={cx(kcProps.kcFormSocialAccountContentClass, kcProps.kcFormSocialAccountClass)}>
                            <ul
                                className={cx(
                                    kcProps.kcFormSocialAccountListClass,
                                    social.providers.length > 4 && kcProps.kcFormSocialAccountDoubleListClass
                                )}
                            >
                                {social.providers.map(p => (
                                    <li key={p.providerId} className={cx(kcProps.kcFormSocialAccountListLinkClass)}>
                                        <a href={p.loginUrl} id={`zocial-${p.alias}`} className={cx("zocial", p.providerId)}>
                                            <span>{p.displayName}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            }
            infoNode={
                realm.password &&
                realm.registrationAllowed &&
                !registrationDisabled && (
                    <div id="kc-registration">
                        <span>
                            {msg("noAccount")}
                            <a tabIndex={6} href={url.registrationUrl}>
                                {msg("doRegister")}
                            </a>
                        </span>
                    </div>
                )
            }
        />
    );
});

export default LoginUsername;
