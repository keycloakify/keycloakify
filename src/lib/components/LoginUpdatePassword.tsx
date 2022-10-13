import React, { memo } from "react";
import DefaultTemplate from "./Template";
import type { TemplateProps } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { useCssAndCx } from "../tools/useCssAndCx";
import type { I18n } from "../i18n";

export type LoginUpdatePasswordProps = KcProps & {
    kcContext: KcContextBase.LoginUpdatePassword;
    i18n: I18n;
    doFetchDefaultThemeResources?: boolean;
    Template?: (props: TemplateProps) => JSX.Element | null;
};

const LoginUpdatePassword = memo((props: LoginUpdatePasswordProps) => {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template = DefaultTemplate, ...kcProps } = props;

    const { cx } = useCssAndCx();

    const { msg, msgStr } = i18n;

    const { url, messagesPerField, isAppInitiatedAction, username } = kcContext;

    return (
        <Template
            {...{ kcContext, i18n, doFetchDefaultThemeResources, ...kcProps }}
            headerNode={msg("updatePasswordTitle")}
            formNode={
                <form id="kc-passwd-update-form" className={cx(kcProps.kcFormClass)} action={url.loginAction} method="post">
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

                    <div className={cx(kcProps.kcFormGroupClass, messagesPerField.printIfExists("password", kcProps.kcFormGroupErrorClass))}>
                        <div className={cx(kcProps.kcLabelWrapperClass)}>
                            <label htmlFor="password-new" className={cx(kcProps.kcLabelClass)}>
                                {msg("passwordNew")}
                            </label>
                        </div>
                        <div className={cx(kcProps.kcInputWrapperClass)}>
                            <input
                                type="password"
                                id="password-new"
                                name="password-new"
                                autoFocus
                                autoComplete="new-password"
                                className={cx(kcProps.kcInputClass)}
                            />
                        </div>
                    </div>

                    <div className={cx(kcProps.kcFormGroupClass, messagesPerField.printIfExists("password-confirm", kcProps.kcFormGroupErrorClass))}>
                        <div className={cx(kcProps.kcLabelWrapperClass)}>
                            <label htmlFor="password-confirm" className={cx(kcProps.kcLabelClass)}>
                                {msg("passwordConfirm")}
                            </label>
                        </div>
                        <div className={cx(kcProps.kcInputWrapperClass)}>
                            <input
                                type="password"
                                id="password-confirm"
                                name="password-confirm"
                                autoComplete="new-password"
                                className={cx(kcProps.kcInputClass)}
                            />
                        </div>
                    </div>

                    <div className={cx(kcProps.kcFormGroupClass)}>
                        <div id="kc-form-options" className={cx(kcProps.kcFormOptionsClass)}>
                            <div className={cx(kcProps.kcFormOptionsWrapperClass)}>
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

                        <div id="kc-form-buttons" className={cx(kcProps.kcFormButtonsClass)}>
                            {isAppInitiatedAction ? (
                                <>
                                    <input
                                        className={cx(kcProps.kcButtonClass, kcProps.kcButtonPrimaryClass, kcProps.kcButtonLargeClass)}
                                        type="submit"
                                        defaultValue={msgStr("doSubmit")}
                                    />
                                    <button
                                        className={cx(kcProps.kcButtonClass, kcProps.kcButtonDefaultClass, kcProps.kcButtonLargeClass)}
                                        type="submit"
                                        name="cancel-aia"
                                        value="true"
                                    >
                                        {msg("doCancel")}
                                    </button>
                                </>
                            ) : (
                                <input
                                    className={cx(
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
