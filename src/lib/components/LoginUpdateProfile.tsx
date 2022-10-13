import React, { memo } from "react";
import DefaultTemplate from "./Template";
import type { TemplateProps } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { useCssAndCx } from "../tools/useCssAndCx";
import type { I18n } from "../i18n";

export type LoginUpdateProfile = KcProps & {
    kcContext: KcContextBase.LoginUpdateProfile;
    i18n: I18n;
    doFetchDefaultThemeResources?: boolean;
    Template?: (props: TemplateProps) => JSX.Element | null;
};

const LoginUpdateProfile = memo((props: LoginUpdateProfile) => {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template = DefaultTemplate, ...kcProps } = props;

    const { cx } = useCssAndCx();

    const { msg, msgStr } = i18n;

    const { url, user, messagesPerField, isAppInitiatedAction } = kcContext;

    return (
        <Template
            {...{ kcContext, i18n, doFetchDefaultThemeResources, ...kcProps }}
            headerNode={msg("loginProfileTitle")}
            formNode={
                <form id="kc-update-profile-form" className={cx(kcProps.kcFormClass)} action={url.loginAction} method="post">
                    {user.editUsernameAllowed && (
                        <div className={cx(kcProps.kcFormGroupClass, messagesPerField.printIfExists("username", kcProps.kcFormGroupErrorClass))}>
                            <div className={cx(kcProps.kcLabelWrapperClass)}>
                                <label htmlFor="username" className={cx(kcProps.kcLabelClass)}>
                                    {msg("username")}
                                </label>
                            </div>
                            <div className={cx(kcProps.kcInputWrapperClass)}>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    defaultValue={user.username ?? ""}
                                    className={cx(kcProps.kcInputClass)}
                                />
                            </div>
                        </div>
                    )}

                    <div className={cx(kcProps.kcFormGroupClass, messagesPerField.printIfExists("email", kcProps.kcFormGroupErrorClass))}>
                        <div className={cx(kcProps.kcLabelWrapperClass)}>
                            <label htmlFor="email" className={cx(kcProps.kcLabelClass)}>
                                {msg("email")}
                            </label>
                        </div>
                        <div className={cx(kcProps.kcInputWrapperClass)}>
                            <input type="text" id="email" name="email" defaultValue={user.email ?? ""} className={cx(kcProps.kcInputClass)} />
                        </div>
                    </div>

                    <div className={cx(kcProps.kcFormGroupClass, messagesPerField.printIfExists("firstName", kcProps.kcFormGroupErrorClass))}>
                        <div className={cx(kcProps.kcLabelWrapperClass)}>
                            <label htmlFor="firstName" className={cx(kcProps.kcLabelClass)}>
                                {msg("firstName")}
                            </label>
                        </div>
                        <div className={cx(kcProps.kcInputWrapperClass)}>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                defaultValue={user.firstName ?? ""}
                                className={cx(kcProps.kcInputClass)}
                            />
                        </div>
                    </div>

                    <div className={cx(kcProps.kcFormGroupClass, messagesPerField.printIfExists("lastName", kcProps.kcFormGroupErrorClass))}>
                        <div className={cx(kcProps.kcLabelWrapperClass)}>
                            <label htmlFor="lastName" className={cx(kcProps.kcLabelClass)}>
                                {msg("lastName")}
                            </label>
                        </div>
                        <div className={cx(kcProps.kcInputWrapperClass)}>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                defaultValue={user.lastName ?? ""}
                                className={cx(kcProps.kcInputClass)}
                            />
                        </div>
                    </div>

                    <div className={cx(kcProps.kcFormGroupClass)}>
                        <div id="kc-form-options" className={cx(kcProps.kcFormOptionsClass)}>
                            <div className={cx(kcProps.kcFormOptionsWrapperClass)} />
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

export default LoginUpdateProfile;
