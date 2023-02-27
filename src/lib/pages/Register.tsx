import React from "react";
import { clsx } from "../tools/clsx";
import type { PageProps } from "../KcProps";
import type { KcContextBase } from "../getKcContext";
import type { I18nBase } from "../i18n";

export default function Register(props: PageProps<Extract<KcContextBase, { pageId: "register.ftl" }>, I18nBase>) {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template, ...kcProps } = props;

    const { url, messagesPerField, register, realm, passwordRequired, recaptchaRequired, recaptchaSiteKey } = kcContext;

    const { msg, msgStr } = i18n;

    return (
        <Template
            {...{ kcContext, i18n, doFetchDefaultThemeResources, ...kcProps }}
            headerNode={msg("registerTitle")}
            formNode={
                <form id="kc-register-form" className={clsx(kcProps.kcFormClass)} action={url.registrationAction} method="post">
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
                                className={clsx(kcProps.kcInputClass)}
                                name="firstName"
                                defaultValue={register.formData.firstName ?? ""}
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
                                className={clsx(kcProps.kcInputClass)}
                                name="lastName"
                                defaultValue={register.formData.lastName ?? ""}
                            />
                        </div>
                    </div>

                    <div className={clsx(kcProps.kcFormGroupClass, messagesPerField.printIfExists("email", kcProps.kcFormGroupErrorClass))}>
                        <div className={clsx(kcProps.kcLabelWrapperClass)}>
                            <label htmlFor="email" className={clsx(kcProps.kcLabelClass)}>
                                {msg("email")}
                            </label>
                        </div>
                        <div className={clsx(kcProps.kcInputWrapperClass)}>
                            <input
                                type="text"
                                id="email"
                                className={clsx(kcProps.kcInputClass)}
                                name="email"
                                defaultValue={register.formData.email ?? ""}
                                autoComplete="email"
                            />
                        </div>
                    </div>
                    {!realm.registrationEmailAsUsername && (
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
                                    className={clsx(kcProps.kcInputClass)}
                                    name="username"
                                    defaultValue={register.formData.username ?? ""}
                                    autoComplete="username"
                                />
                            </div>
                        </div>
                    )}
                    {passwordRequired && (
                        <>
                            <div
                                className={clsx(kcProps.kcFormGroupClass, messagesPerField.printIfExists("password", kcProps.kcFormGroupErrorClass))}
                            >
                                <div className={clsx(kcProps.kcLabelWrapperClass)}>
                                    <label htmlFor="password" className={clsx(kcProps.kcLabelClass)}>
                                        {msg("password")}
                                    </label>
                                </div>
                                <div className={clsx(kcProps.kcInputWrapperClass)}>
                                    <input
                                        type="password"
                                        id="password"
                                        className={clsx(kcProps.kcInputClass)}
                                        name="password"
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            <div
                                className={clsx(
                                    kcProps.kcFormGroupClass,
                                    messagesPerField.printIfExists("password-confirm", kcProps.kcFormGroupErrorClass)
                                )}
                            >
                                <div className={clsx(kcProps.kcLabelWrapperClass)}>
                                    <label htmlFor="password-confirm" className={clsx(kcProps.kcLabelClass)}>
                                        {msg("passwordConfirm")}
                                    </label>
                                </div>
                                <div className={clsx(kcProps.kcInputWrapperClass)}>
                                    <input type="password" id="password-confirm" className={clsx(kcProps.kcInputClass)} name="password-confirm" />
                                </div>
                            </div>
                        </>
                    )}
                    {recaptchaRequired && (
                        <div className="form-group">
                            <div className={clsx(kcProps.kcInputWrapperClass)}>
                                <div className="g-recaptcha" data-size="compact" data-sitekey={recaptchaSiteKey}></div>
                            </div>
                        </div>
                    )}
                    <div className={clsx(kcProps.kcFormGroupClass)}>
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
                                value={msgStr("doRegister")}
                            />
                        </div>
                    </div>
                </form>
            }
        />
    );
}
