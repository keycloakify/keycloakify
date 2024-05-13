import { useState } from "react";
import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import { useTermsMarkdown } from "keycloakify/login/lib/useDownloadTerms";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFields";
import { Markdown } from "keycloakify/tools/Markdown";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";

type RegisterProps = PageProps<Extract<KcContext, { pageId: "register.ftl" }>, I18n> & {
    UserProfileFormFields: LazyOrNot<(props: UserProfileFormFieldsProps) => JSX.Element>;
};

export default function Register(props: RegisterProps) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes, UserProfileFormFields } = props;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    const { url, messagesPerField, recaptchaRequired, recaptchaSiteKey, termsAcceptanceRequired } = kcContext;

    const { msg, msgStr } = i18n;

    const [isFormSubmittable, setIsFormSubmittable] = useState(false);

    return (
        <Template {...{ kcContext, i18n, doUseDefaultCss, classes }} headerNode={msg("registerTitle")}>
            <form id="kc-register-form" className={getClassName("kcFormClass")} action={url.registrationAction} method="post">
                <UserProfileFormFields
                    {...{
                        kcContext,
                        i18n,
                        getClassName,
                        messagesPerField
                    }}
                    onIsFormSubmittableValueChange={setIsFormSubmittable}
                />
                {termsAcceptanceRequired && (
                    <TermsAcceptance
                        {...{
                            i18n,
                            getClassName,
                            messagesPerField
                        }}
                    />
                )}
                {recaptchaRequired && (
                    <div className="form-group">
                        <div className={getClassName("kcInputWrapperClass")}>
                            <div className="g-recaptcha" data-size="compact" data-sitekey={recaptchaSiteKey}></div>
                        </div>
                    </div>
                )}
                <div className={getClassName("kcFormGroupClass")}>
                    <div id="kc-form-options" className={getClassName("kcFormOptionsClass")}>
                        <div className={getClassName("kcFormOptionsWrapperClass")}>
                            <span>
                                <a href={url.loginUrl}>{msg("backToLogin")}</a>
                            </span>
                        </div>
                    </div>
                    <div id="kc-form-buttons" className={getClassName("kcFormButtonsClass")}>
                        <input
                            disabled={!isFormSubmittable}
                            className={clsx(
                                getClassName("kcButtonClass"),
                                getClassName("kcButtonPrimaryClass"),
                                getClassName("kcButtonBlockClass"),
                                getClassName("kcButtonLargeClass")
                            )}
                            type="submit"
                            value={msgStr("doRegister")}
                        />
                    </div>
                </div>
            </form>
        </Template>
    );
}

function TermsAcceptance(props: {
    i18n: I18n;
    getClassName: ReturnType<typeof useGetClassName>["getClassName"];
    messagesPerField: Pick<KcContext["messagesPerField"], "existsError" | "get">;
}) {
    const { i18n, getClassName, messagesPerField } = props;

    const { msg } = i18n;

    // NOTE: Refer to https://docs.keycloakify.dev/terms-and-conditions to load your terms and conditions.
    const { termsMarkdown } = useTermsMarkdown();

    if (termsMarkdown === undefined) {
        return null;
    }

    return (
        <>
            <div className="form-group">
                <div className={getClassName("kcInputWrapperClass")}>
                    {msg("termsTitle")}
                    <div id="kc-registration-terms-text">
                        <Markdown>{termsMarkdown}</Markdown>
                    </div>
                </div>
            </div>
            <div className="form-group">
                <div className={getClassName("kcLabelWrapperClass")}>
                    <input
                        type="checkbox"
                        id="termsAccepted"
                        name="termsAccepted"
                        className={getClassName("kcCheckboxInputClass")}
                        aria-invalid={messagesPerField.existsError("termsAccepted")}
                    />
                    <label htmlFor="termsAccepted" className={getClassName("kcLabelClass")}>
                        {msg("acceptTerms")}
                    </label>
                </div>
                {messagesPerField.existsError("termsAccepted") && (
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <span id="input-error-terms-accepted" className={getClassName("kcInputErrorMessageClass")} aria-live="polite">
                            {messagesPerField.get("termsAccepted")}
                        </span>
                    </div>
                )}
            </div>
        </>
    );
}
