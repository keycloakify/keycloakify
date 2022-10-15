import React, { memo, useState } from "react";
import DefaultTemplate from "./Template";
import type { TemplateProps } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { clsx } from "../tools/clsx";
import type { I18n } from "../i18n";
import { UserProfileFormFields } from "./shared/UserProfileCommons";

export type RegisterUserProfileProps = KcProps & {
    kcContext: KcContextBase.RegisterUserProfile;
    i18n: I18n;
    doFetchDefaultThemeResources?: boolean;
    Template?: (props: TemplateProps) => JSX.Element | null;
};

const RegisterUserProfile = memo((props: RegisterUserProfileProps) => {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template = DefaultTemplate, ...kcProps } = props;

    const { url, messagesPerField, recaptchaRequired, recaptchaSiteKey } = kcContext;

    const { msg, msgStr } = i18n;

    const [isFomSubmittable, setIsFomSubmittable] = useState(false);

    return (
        <Template
            {...{ kcContext, i18n, doFetchDefaultThemeResources, ...kcProps }}
            displayMessage={messagesPerField.exists("global")}
            displayRequiredFields={true}
            headerNode={msg("registerTitle")}
            formNode={
                <form id="kc-register-form" className={clsx(kcProps.kcFormClass)} action={url.registrationAction} method="post">
                    <UserProfileFormFields kcContext={kcContext} onIsFormSubmittableValueChange={setIsFomSubmittable} i18n={i18n} {...kcProps} />
                    {recaptchaRequired && (
                        <div className="form-group">
                            <div className={clsx(kcProps.kcInputWrapperClass)}>
                                <div className="g-recaptcha" data-size="compact" data-sitekey={recaptchaSiteKey} />
                            </div>
                        </div>
                    )}
                    <div className={clsx(kcProps.kcFormGroupClass)} style={{ "marginBottom": 30 }}>
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
                                disabled={!isFomSubmittable}
                            />
                        </div>
                    </div>
                </form>
            }
        />
    );
});

export default RegisterUserProfile;
