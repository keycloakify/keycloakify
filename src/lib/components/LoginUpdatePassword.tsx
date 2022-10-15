import React, { memo } from "react";
import DefaultTemplate from "./Template";
import type { TemplateProps } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { clsx } from "../tools/clsx";
import type { I18n } from "../i18n";

export type LoginUpdatePasswordProps = KcProps & {
    kcContext: KcContextBase.LoginUpdatePassword;
    i18n: I18n;
    doFetchDefaultThemeResources?: boolean;
    Template?: (props: TemplateProps) => JSX.Element | null;
};

const LoginUpdatePassword = memo((props: LoginUpdatePasswordProps) => {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template = DefaultTemplate, ...kcProps } = props;

    const { msg, msgStr } = i18n;

    const { url, messagesPerField, isAppInitiatedAction, username } = kcContext;

    return (
        <Template
            {...{ kcContext, i18n, doFetchDefaultThemeResources, ...kcProps }}
            headerNode={msg("updatePasswordTitle")}
            formNode={
                <form id="kc-passwd-update-form" className={clsx(kcProps.kcFormClass)} action={url.loginAction} method="post">
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        readOnly={true}
                        autoComplete="username"
                        style={{ display: "none" }}
                    />
                    <input type="password" id="password" name="password" autoComplete="current-password" style={{ display: "none" }} />

                    <div className={clsx(kcProps.kcFormGroupClass, messagesPerField.printIfExists("password", kcProps.kcFormGroupErrorClass))}>
                        <div className={clsx(kcProps.kcLabelWrapperClass)}>
                            <label htmlFor="password-new" className={clsx(kcProps.kcLabelClass)}>
                                {msg("passwordNew")}
                            </label>
                        </div>
                        <div className={clsx(kcProps.kcInputWrapperClass)}>
                            <input
                                type="password"
                                id="password-new"
                                name="password-new"
                                autoFocus
                                autoComplete="new-password"
                                className={clsx(kcProps.kcInputClass)}
                            />
                        </div>
                    </div>

                    <div
                        className={clsx(kcProps.kcFormGroupClass, messagesPerField.printIfExists("password-confirm", kcProps.kcFormGroupErrorClass))}
                    >
                        <div className={clsx(kcProps.kcLabelWrapperClass)}>
                            <label htmlFor="password-confirm" className={clsx(kcProps.kcLabelClass)}>
                                {msg("passwordConfirm")}
                            </label>
                        </div>
                        <div className={clsx(kcProps.kcInputWrapperClass)}>
                            <input
                                type="password"
                                id="password-confirm"
                                name="password-confirm"
                                autoComplete="new-password"
                                className={clsx(kcProps.kcInputClass)}
                            />
                        </div>
                    </div>

                    <div className={clsx(kcProps.kcFormGroupClass)}>
                        <div id="kc-form-options" className={clsx(kcProps.kcFormOptionsClass)}>
                            <div className={clsx(kcProps.kcFormOptionsWrapperClass)}>
                                {isAppInitiatedAction && (
                                    <div className="checkbox">
                                        <label>
                                            <input type="checkbox" id="logout-sessions" name="logout-sessions" value="on" checked />
                                            {msgStr("logoutOtherSessions")}
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div id="kc-form-buttons" className={clsx(kcProps.kcFormButtonsClass)}>
                            {isAppInitiatedAction ? (
                                <>
                                    <input
                                        className={clsx(kcProps.kcButtonClass, kcProps.kcButtonPrimaryClass, kcProps.kcButtonLargeClass)}
                                        type="submit"
                                        defaultValue={msgStr("doSubmit")}
                                    />
                                    <button
                                        className={clsx(kcProps.kcButtonClass, kcProps.kcButtonDefaultClass, kcProps.kcButtonLargeClass)}
                                        type="submit"
                                        name="cancel-aia"
                                        value="true"
                                    >
                                        {msg("doCancel")}
                                    </button>
                                </>
                            ) : (
                                <input
                                    className={clsx(
                                        kcProps.kcButtonClass,
                                        kcProps.kcButtonPrimaryClass,
                                        kcProps.kcButtonBlockClass,
                                        kcProps.kcButtonLargeClass
                                    )}
                                    type="submit"
                                    defaultValue={msgStr("doSubmit")}
                                />
                            )}
                        </div>
                    </div>
                </form>
            }
        />
    );
});

export default LoginUpdatePassword;
