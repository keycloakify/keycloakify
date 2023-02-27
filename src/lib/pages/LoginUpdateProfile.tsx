import React from "react";
import { clsx } from "../tools/clsx";
import type { PageProps } from "../KcProps";
import type { KcContextBase } from "../getKcContext";
import type { I18nBase } from "../i18n";

export default function LoginUpdateProfile(props: PageProps<Extract<KcContextBase, { pageId: "login-update-profile.ftl" }>, I18nBase>) {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template, ...kcProps } = props;

    const { msg, msgStr } = i18n;

    const { url, user, messagesPerField, isAppInitiatedAction } = kcContext;

    return (
        <Template
            {...{ kcContext, i18n, doFetchDefaultThemeResources, ...kcProps }}
            headerNode={msg("loginProfileTitle")}
            formNode={
                <form id="kc-update-profile-form" className={clsx(kcProps.kcFormClass)} action={url.loginAction} method="post">
                    {user.editUsernameAllowed && (
                        <div className={clsx(kcProps.kcFormGroupClass, messagesPerField.printIfExists("username", kcProps.kcFormGroupErrorClass))}>
                            <div className={clsx(kcProps.kcLabelWrapperClass)}>
                                <label htmlFor="username" className={clsx(kcProps.kcLabelClass)}>
                                    {msg("username")}
                                </label>
                            </div>
                            <div className={clsx(kcProps.kcInputWrapperClass)}>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    defaultValue={user.username ?? ""}
                                    className={clsx(kcProps.kcInputClass)}
                                />
                            </div>
                        </div>
                    )}

                    <div className={clsx(kcProps.kcFormGroupClass, messagesPerField.printIfExists("email", kcProps.kcFormGroupErrorClass))}>
                        <div className={clsx(kcProps.kcLabelWrapperClass)}>
                            <label htmlFor="email" className={clsx(kcProps.kcLabelClass)}>
                                {msg("email")}
                            </label>
                        </div>
                        <div className={clsx(kcProps.kcInputWrapperClass)}>
                            <input type="text" id="email" name="email" defaultValue={user.email ?? ""} className={clsx(kcProps.kcInputClass)} />
                        </div>
                    </div>

                    <div className={clsx(kcProps.kcFormGroupClass, messagesPerField.printIfExists("firstName", kcProps.kcFormGroupErrorClass))}>
                        <div className={clsx(kcProps.kcLabelWrapperClass)}>
                            <label htmlFor="firstName" className={clsx(kcProps.kcLabelClass)}>
                                {msg("firstName")}
                            </label>
                        </div>
                        <div className={clsx(kcProps.kcInputWrapperClass)}>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                defaultValue={user.firstName ?? ""}
                                className={clsx(kcProps.kcInputClass)}
                            />
                        </div>
                    </div>

                    <div className={clsx(kcProps.kcFormGroupClass, messagesPerField.printIfExists("lastName", kcProps.kcFormGroupErrorClass))}>
                        <div className={clsx(kcProps.kcLabelWrapperClass)}>
                            <label htmlFor="lastName" className={clsx(kcProps.kcLabelClass)}>
                                {msg("lastName")}
                            </label>
                        </div>
                        <div className={clsx(kcProps.kcInputWrapperClass)}>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                defaultValue={user.lastName ?? ""}
                                className={clsx(kcProps.kcInputClass)}
                            />
                        </div>
                    </div>

                    <div className={clsx(kcProps.kcFormGroupClass)}>
                        <div id="kc-form-options" className={clsx(kcProps.kcFormOptionsClass)}>
                            <div className={clsx(kcProps.kcFormOptionsWrapperClass)} />
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
}
