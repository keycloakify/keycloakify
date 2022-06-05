import { memo } from "react";
import { Template } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import type { I18n } from "../i18n";
import { useCssAndCx } from "tss-react";

export const LoginResetPassword = memo(
    ({ kcContext, useI18n, ...props }: { kcContext: KcContextBase.LoginResetPassword; useI18n: () => I18n } & KcProps) => {
        const { url, realm, auth } = kcContext;

        const { msg, msgStr } = useI18n();

        const { cx } = useCssAndCx();

        return (
            <Template
                {...{ kcContext, useI18n, ...props }}
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
                                    className={cx(
                                        props.kcButtonClass,
                                        props.kcButtonPrimaryClass,
                                        props.kcButtonBlockClass,
                                        props.kcButtonLargeClass,
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
    },
);
