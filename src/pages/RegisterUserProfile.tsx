import { useState } from "react";
import { clsx } from "keycloakify/tools/clsx";
import { UserProfileFormFields } from "./shared/UserProfileCommons";
import { type PageProps, defaultClasses } from "keycloakify/pages/PageProps";
import { useGetClassName } from "keycloakify/lib/useGetClassName";
import type { KcContextBase as KcContext } from "../kcContext";
import type { I18nBase as I18n } from "../i18n";

export default function RegisterUserProfile(props: PageProps<Extract<KcContext, { pageId: "register-user-profile.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({
        "defaultClasses": !doUseDefaultCss ? undefined : defaultClasses,
        classes
    });

    const { url, messagesPerField, recaptchaRequired, recaptchaSiteKey } = kcContext;

    const { msg, msgStr } = i18n;

    const [isFomSubmittable, setIsFomSubmittable] = useState(false);

    return (
        <Template
            {...{ kcContext, i18n, doUseDefaultCss, classes }}
            displayMessage={messagesPerField.exists("global")}
            displayRequiredFields={true}
            headerNode={msg("registerTitle")}
            formNode={
                <form id="kc-register-form" className={getClassName("kcFormClass")} action={url.registrationAction} method="post">
                    <UserProfileFormFields
                        kcContext={kcContext}
                        onIsFormSubmittableValueChange={setIsFomSubmittable}
                        i18n={i18n}
                        getClassName={getClassName}
                    />
                    {recaptchaRequired && (
                        <div className="form-group">
                            <div className={getClassName("kcInputWrapperClass")}>
                                <div className="g-recaptcha" data-size="compact" data-sitekey={recaptchaSiteKey} />
                            </div>
                        </div>
                    )}
                    <div className={getClassName("kcFormGroupClass")} style={{ "marginBottom": 30 }}>
                        <div id="kc-form-options" className={getClassName("kcFormOptionsClass")}>
                            <div className={getClassName("kcFormOptionsWrapperClass")}>
                                <span>
                                    <a href={url.loginUrl}>{msg("backToLogin")}</a>
                                </span>
                            </div>
                        </div>

                        <div id="kc-form-buttons" className={getClassName("kcFormButtonsClass")}>
                            <input
                                className={clsx(
                                    getClassName("kcButtonClass"),
                                    getClassName("kcButtonPrimaryClass"),
                                    getClassName("kcButtonBlockClass"),
                                    getClassName("kcButtonLargeClass")
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
}
