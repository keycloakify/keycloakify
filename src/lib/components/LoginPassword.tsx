import React, { useState, memo } from "react";
import DefaultTemplate from "./Template";
import type { TemplateProps } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { useCssAndCx } from "../tools/useCssAndCx";
import { useConstCallback } from "powerhooks/useConstCallback";
import type { FormEventHandler } from "react";
import type { I18n } from "../i18n";

export type LoginPasswordProps = KcProps & {
    kcContext: KcContextBase.LoginPassword;
    i18n: I18n;
    doFetchDefaultThemeResources?: boolean;
    Template?: (props: TemplateProps) => JSX.Element | null;
};

const LoginPassword = memo((props: LoginPasswordProps) => {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template = DefaultTemplate, ...kcProps } = props;

    const { realm, url, login } = kcContext;

    const { msg, msgStr } = i18n;

    const { cx } = useCssAndCx();

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
                            <div className={cx(kcProps.kcFormGroupClass)}>
                                <hr />
                                <label htmlFor="password" className={cx(kcProps.kcLabelClass)}>
                                    {msg("password")}
                                </label>
                                <input
                                    tabIndex={2}
                                    id="password"
                                    className={cx(kcProps.kcInputClass)}
                                    name="password"
                                    type="password"
                                    autoFocus={true}
                                    autoComplete="on"
                                    defaultValue={login.password ?? ""}
                                />
                            </div>
                            <div className={cx(kcProps.kcFormGroupClass, kcProps.kcFormSettingClass)}>
                                <div id="kc-form-options" />
                                <div className={cx(kcProps.kcFormOptionsWrapperClass)}>
                                    {realm.resetPasswordAllowed && (
                                        <span>
                                            <a tabIndex={5} href={url.loginResetCredentialsUrl}>
                                                {msg("doForgotPassword")}
                                            </a>
                                        </span>
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
                    </div>
                </div>
            }
        />
    );
});

export default LoginPassword;
