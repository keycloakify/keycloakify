import React, { memo } from "react";
import DefaultTemplate from "./Template";
import type { TemplateProps } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { clsx } from "../tools/clsx";
import type { I18n } from "../i18n";

export type LoginResetPasswordProps = KcProps & {
    kcContext: KcContextBase.LoginResetPassword;
    i18n: I18n;
    doFetchDefaultThemeResources?: boolean;
    Template?: (props: TemplateProps) => JSX.Element | null;
};

const LoginResetPassword = memo((props: LoginResetPasswordProps) => {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template = DefaultTemplate, ...kcProps } = props;

    const { url, realm, auth } = kcContext;

    const { msg, msgStr } = i18n;

    return (
        <Template
            {...{ kcContext, i18n, doFetchDefaultThemeResources, ...kcProps }}
            displayMessage={false}
            headerNode={msg("emailForgotTitle")}
            formNode={
                <form id="kc-reset-password-form" className={clsx(kcProps.kcFormClass)} action={url.loginAction} method="post">
                    <div className={clsx(kcProps.kcFormGroupClass)}>
                        <div className={clsx(kcProps.kcLabelWrapperClass)}>
                            <label htmlFor="username" className={clsx(kcProps.kcLabelClass)}>
                                {!realm.loginWithEmailAllowed
                                    ? msg("username")
                                    : !realm.registrationEmailAsUsername
                                    ? msg("usernameOrEmail")
                                    : msg("email")}
                            </label>
                        </div>
                        <div className={clsx(kcProps.kcInputWrapperClass)}>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                className={clsx(kcProps.kcInputClass)}
                                autoFocus
                                defaultValue={auth !== undefined && auth.showUsername ? auth.attemptedUsername : undefined}
                            />
                        </div>
                    </div>
                    <div className={clsx(kcProps.kcFormGroupClass, kcProps.kcFormSettingClass)}>
                        <div id="kc-form-options" className={clsx(kcProps.kcFormOptionsClass)}>
                            <div className={clsx(kcProps.kcFormOptionsWrapperClass)}>
                                <span>
                                    <a href={url.loginUrl}>{msg("backToLogin")}</a>
                                </span>
                            </div>
                        </div>

                        <div id="kc-form-buttons" className={clsx(kcProps.kcFormButtonsClass)}>
                            <input
                                className={clsx(
                                    kcProps.kcButtonClass,
                                    kcProps.kcButtonPrimaryClass,
                                    kcProps.kcButtonBlockClass,
                                    kcProps.kcButtonLargeClass
                                )}
                                type="submit"
                                value={msgStr("doSubmit")}
                            />
                        </div>
                    </div>
                </form>
            }
            infoNode={msg("emailInstruction")}
        />
    );
});

export default LoginResetPassword;
