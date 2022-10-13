import React, { memo } from "react";
import DefaultTemplate from "./Template";
import type { TemplateProps } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { useCssAndCx } from "../tools/useCssAndCx";
import type { I18n } from "../i18n";

export type RegisterProps = KcProps & {
    kcContext: KcContextBase.Register;
    i18n: I18n;
    doFetchDefaultThemeResources?: boolean;
    Template?: (props: TemplateProps) => JSX.Element | null;
};

const Register = memo((props: RegisterProps) => {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template = DefaultTemplate, ...kcProps } = props;

    const { url, messagesPerField, register, realm, passwordRequired, recaptchaRequired, recaptchaSiteKey } = kcContext;

    const { msg, msgStr } = i18n;

    const { cx } = useCssAndCx();

    return (
        <Template
            {...{ kcContext, i18n, doFetchDefaultThemeResources, ...kcProps }}
            headerNode={msg("registerTitle")}
            formNode={
                <form id="kc-register-form" className={cx(kcProps.kcFormClass)} action={url.registrationAction} method="post">
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
                                className={cx(kcProps.kcInputClass)}
                                name="firstName"
                                defaultValue={register.formData.firstName ?? ""}
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
                                className={cx(kcProps.kcInputClass)}
                                name="lastName"
                                defaultValue={register.formData.lastName ?? ""}
                            />
                        </div>
                    </div>

                    <div className={cx(kcProps.kcFormGroupClass, messagesPerField.printIfExists("email", kcProps.kcFormGroupErrorClass))}>
                        <div className={cx(kcProps.kcLabelWrapperClass)}>
                            <label htmlFor="email" className={cx(kcProps.kcLabelClass)}>
                                {msg("email")}
                            </label>
                        </div>
                        <div className={cx(kcProps.kcInputWrapperClass)}>
                            <input
                                type="text"
                                id="email"
                                className={cx(kcProps.kcInputClass)}
                                name="email"
                                defaultValue={register.formData.email ?? ""}
                                autoComplete="email"
                            />
                        </div>
                    </div>
                    {!realm.registrationEmailAsUsername && (
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
                                    className={cx(kcProps.kcInputClass)}
                                    name="username"
                                    defaultValue={register.formData.username ?? ""}
                                    autoComplete="username"
                                />
                            </div>
                        </div>
                    )}
                    {passwordRequired && (
                        <>
                            <div className={cx(kcProps.kcFormGroupClass, messagesPerField.printIfExists("password", kcProps.kcFormGroupErrorClass))}>
                                <div className={cx(kcProps.kcLabelWrapperClass)}>
                                    <label htmlFor="password" className={cx(kcProps.kcLabelClass)}>
                                        {msg("password")}
                                    </label>
                                </div>
                                <div className={cx(kcProps.kcInputWrapperClass)}>
                                    <input
                                        type="password"
                                        id="password"
                                        className={cx(kcProps.kcInputClass)}
                                        name="password"
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            <div
                                className={cx(
                                    kcProps.kcFormGroupClass,
                                    messagesPerField.printIfExists("password-confirm", kcProps.kcFormGroupErrorClass)
                                )}
                            >
                                <div className={cx(kcProps.kcLabelWrapperClass)}>
                                    <label htmlFor="password-confirm" className={cx(kcProps.kcLabelClass)}>
                                        {msg("passwordConfirm")}
                                    </label>
                                </div>
                                <div className={cx(kcProps.kcInputWrapperClass)}>
                                    <input type="password" id="password-confirm" className={cx(kcProps.kcInputClass)} name="password-confirm" />
                                </div>
                            </div>
                        </>
                    )}
                    {recaptchaRequired && (
                        <div className="form-group">
                            <div className={cx(kcProps.kcInputWrapperClass)}>
                                <div className="g-recaptcha" data-size="compact" data-sitekey={recaptchaSiteKey}></div>
                            </div>
                        </div>
                    )}
                    <div className={cx(kcProps.kcFormGroupClass)}>
                        <div id="kc-form-options" className={cx(kcProps.kcFormOptionsClass)}>
                            <div className={cx(kcProps.kcFormOptionsWrapperClass)}>
                                <span>
                                    <a href={url.loginUrl}>{msg("backToLogin")}</a>
                                </span>
                            </div>
                        </div>

                        <div id="kc-form-buttons" className={cx(kcProps.kcFormButtonsClass)}>
                            <input
                                className={cx(
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
});

export default Register;
