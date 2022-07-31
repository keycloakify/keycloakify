import React, { memo } from "react";
import Template from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { useCssAndCx } from "tss-react";
import type { I18n } from "../i18n";

const LoginResetPassword = memo(({ kcContext, i18n, ...props }: { kcContext: KcContextBase.LoginResetPassword; i18n: I18n } & KcProps) => {
    const { url, realm, auth } = kcContext;

    const { msg, msgStr } = i18n;

    const { cx } = useCssAndCx();

    return (
        <Template
            {...{ kcContext, i18n, ...props }}
            doFetchDefaultThemeResources={true}
            displayMessage={false}
            headerNode={msg("emailForgotTitle")}
            formNode={
                <form id="kc-reset-password-form" className={cx(props.kcFormClass)} action={url.loginAction} method="post">
                    <div className={cx(props.kcFormGroupClass)}>
                        <div className={cx(props.kcLabelWrapperClass)}>
                            <label htmlFor="username" className={cx(props.kcLabelClass)}>
                                {!realm.loginWithEmailAllowed
                                    ? msg("username")
                                    : !realm.registrationEmailAsUsername
                                    ? msg("usernameOrEmail")
                                    : msg("email")}
                            </label>
                        </div>
                        <div className={cx(props.kcInputWrapperClass)}>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                className={cx(props.kcInputClass)}
                                autoFocus
                                defaultValue={auth !== undefined && auth.showUsername ? auth.attemptedUsername : undefined}
                            />
                        </div>
                    </div>
                    <div className={cx(props.kcFormGroupClass, props.kcFormSettingClass)}>
                        <div id="kc-form-options" className={cx(props.kcFormOptionsClass)}>
                            <div className={cx(props.kcFormOptionsWrapperClass)}>
                                <span>
                                    <a href={url.loginUrl}>{msg("backToLogin")}</a>
                                </span>
                            </div>
                        </div>

                        <div id="kc-form-buttons" className={cx(props.kcFormButtonsClass)}>
                            <input
                                className={cx(props.kcButtonClass, props.kcButtonPrimaryClass, props.kcButtonBlockClass, props.kcButtonLargeClass)}
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
