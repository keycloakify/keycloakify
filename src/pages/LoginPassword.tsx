import React, { useState } from "react";
import { clsx } from "../tools/clsx";
import { useConstCallback } from "../tools/useConstCallback";
import type { FormEventHandler } from "react";
import type { PageProps } from "../KcProps";
import type { KcContextBase } from "../getKcContext";
import type { I18nBase } from "../i18n";

export default function LoginPassword(props: PageProps<Extract<KcContextBase, { "pageId": "login-password.ftl" }>, I18nBase>) {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template, ...kcProps } = props;

    const { realm, url, login } = kcContext;

    const { msg, msgStr } = i18n;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    const onSubmit = useConstCallback<FormEventHandler<HTMLFormElement>>(e => {
        e.preventDefault();

        setIsLoginButtonDisabled(true);

        const formElement = e.target as HTMLFormElement;

        formElement.submit();
    });

    return (
        <Template
            {...{ kcContext, i18n, doFetchDefaultThemeResources, ...kcProps }}
            headerNode={msg("doLogIn")}
            formNode={
                <div id="kc-form">
                    <div id="kc-form-wrapper">
                        <form id="kc-form-login" onSubmit={onSubmit} action={url.loginAction} method="post">
                            <div className={clsx(kcProps.kcFormGroupClass)}>
                                <hr />
                                <label htmlFor="password" className={clsx(kcProps.kcLabelClass)}>
                                    {msg("password")}
                                </label>
                                <input
                                    tabIndex={2}
                                    id="password"
                                    className={clsx(kcProps.kcInputClass)}
                                    name="password"
                                    type="password"
                                    autoFocus={true}
                                    autoComplete="on"
                                    defaultValue={login.password ?? ""}
                                />
                            </div>
                            <div className={clsx(kcProps.kcFormGroupClass, kcProps.kcFormSettingClass)}>
                                <div id="kc-form-options" />
                                <div className={clsx(kcProps.kcFormOptionsWrapperClass)}>
                                    {realm.resetPasswordAllowed && (
                                        <span>
                                            <a tabIndex={5} href={url.loginResetCredentialsUrl}>
                                                {msg("doForgotPassword")}
                                            </a>
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div id="kc-form-buttons" className={clsx(kcProps.kcFormGroupClass)}>
                                <input
                                    tabIndex={4}
                                    className={clsx(
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
                    </div>
                </div>
            }
        />
    );
}
