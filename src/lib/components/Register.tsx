

import { useState, memo } from "react";
import { Template } from "./Template";
import type { KcPagesProperties } from "./KcProperties";
import { defaultKcPagesProperties } from "./KcProperties";
import { assert } from "../tools/assert";
import { kcContext } from "../kcContext";
import { useKcTranslation } from "../i18n/useKcTranslation";
import { cx } from "tss-react";

export type RegisterPageProps = {
    kcProperties?: KcPagesProperties;
};

export const Register = memo((props: RegisterPageProps) => {

    const { kcProperties = {} } = props;

    const { t, tStr } = useKcTranslation();

    Object.assign(kcProperties, defaultKcPagesProperties);

    const [{
        url,
        messagesPerField,
        register,
        realm,
        passwordRequired,
        recaptchaRequired,
        recaptchaSiteKey
    }] = useState(() => {

        assert(
            kcContext !== undefined && 
            kcContext.pageBasename === "register.ftl"
        );

        return kcContext;

    });

    return (
        <Template
            kcProperties={kcProperties}
            headerNode={t("registerTitle")}
            formNode={
                <form id="kc-register-form" className={cx(kcProperties.kcFormClass)} action={url.registrationAction} method="post">

                    <div className={cx(kcProperties.kcFormGroupClass, messagesPerField.printIfExists('firstName', kcProperties.kcFormGroupErrorClass))}>
                        <div className={cx(kcProperties.kcLabelWrapperClass)}>
                            <label htmlFor="firstName" className={cx(kcProperties.kcLabelClass)}>{t("firstName")}</label>
                        </div>
                        <div className={cx(kcProperties.kcInputWrapperClass)}>
                            <input type="text" id="firstName" className={cx(kcProperties.kcInputClass)} name="firstName"
                                value={register.formData.firstName ?? ""}
                            />
                        </div>
                    </div>

                    <div className={cx(kcProperties.kcFormGroupClass, messagesPerField.printIfExists("lastName", kcProperties.kcFormGroupErrorClass))}>
                        <div className={cx(kcProperties.kcLabelWrapperClass)}>
                            <label htmlFor="lastName" className={cx(kcProperties.kcLabelClass)}>{t("lastName")}</label>
                        </div>
                        <div className={cx(kcProperties.kcInputWrapperClass)}>
                            <input type="text" id="lastName" className={cx(kcProperties.kcInputClass)} name="lastName"
                                value={register.formData.lastName ?? ""}
                            />
                        </div>
                    </div>

                    <div className={cx(kcProperties.kcFormGroupClass, messagesPerField.printIfExists('email', kcProperties.kcFormGroupErrorClass))}>
                        <div className={cx(kcProperties.kcLabelWrapperClass)}>
                            <label htmlFor="email" className={cx(kcProperties.kcLabelClass)}>{t("email")}</label>
                        </div>
                        <div className={cx(kcProperties.kcInputWrapperClass)}>
                            <input type="text" id="email" className={cx(kcProperties.kcInputClass)} name="email"
                                value={register.formData.email ?? ""} autoComplete="email"
                            />
                        </div>
                    </div>

                    {
                        !realm.registrationEmailAsUsername &&

                        <div className={cx(kcProperties.kcFormGroupClass, messagesPerField.printIfExists('username', kcProperties.kcFormGroupErrorClass))}>
                            <div className={cx(kcProperties.kcLabelWrapperClass)}>
                                <label htmlFor="username" className={cx(kcProperties.kcLabelClass)}>{t("username")}</label>
                            </div>
                            <div className={cx(kcProperties.kcInputWrapperClass)}>
                                <input type="text" id="username" className={cx(kcProperties.kcInputClass)} name="username"
                                    value={register.formData.username ?? ""} autoComplete="username" />
                            </div>
                        </div >

                    }

                    {
                        passwordRequired &&
                        <>

                            <div className={cx(kcProperties.kcFormGroupClass, messagesPerField.printIfExists("password", kcProperties.kcFormGroupErrorClass))}>
                                <div className={cx(kcProperties.kcLabelWrapperClass)}>
                                    <label htmlFor="password" className={cx(kcProperties.kcLabelClass)}>{t("password")}</label>
                                </div>
                                <div className={cx(kcProperties.kcInputWrapperClass)}>
                                    <input type="password" id="password" className={cx(kcProperties.kcInputClass)} name="password" autoComplete="new-password" />
                                </div>
                            </div>

                            <div className={cx(kcProperties.kcFormGroupClass, messagesPerField.printIfExists("password-confirm", kcProperties.kcFormGroupErrorClass))}>
                                <div className={cx(kcProperties.kcLabelWrapperClass)}>
                                    <label htmlFor="password-confirm" className={cx(kcProperties.kcLabelClass)}>{t("passwordConfirm")}</label>
                                </div>
                                <div className={cx(kcProperties.kcInputWrapperClass)}>
                                    <input type="password" id="password-confirm" className={cx(kcProperties.kcInputClass)} name="password-confirm" />
                                </div>
                            </div>
                        </>

                    }
                    {
                        recaptchaRequired &&
                        <div className="form-group">
                            <div className={cx(kcProperties.kcInputWrapperClass)}>
                                <div className="g-recaptcha" data-size="compact" data-sitekey={recaptchaSiteKey}></div>
                            </div>
                        </div>
                    }



                    <div className={cx(kcProperties.kcFormGroupClass)}>
                        <div id="kc-form-options" className={cx(kcProperties.kcFormOptionsClass)}>
                            <div className={cx(kcProperties.kcFormOptionsWrapperClass)}>
                                <span><a href={url.loginUrl}>{t("backToLogin")}</a></span>
                            </div>
                        </div>

                        <div id="kc-form-buttons" className={cx(kcProperties.kcFormButtonsClass)}>
                            <input className={cx(kcProperties.kcButtonClass, kcProperties.kcButtonPrimaryClass, kcProperties.kcButtonBlockClass, kcProperties.kcButtonLargeClass)} type="submit"
                                value={tStr("doRegister")} />
                        </div>
                    </div>
                </form >
            }
        />
    );
});


