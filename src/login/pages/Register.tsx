import { useState } from "react";
import { Markdown } from "keycloakify/tools/Markdown";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import { useTermsMarkdown } from "keycloakify/login/lib/useDownloadTerms";
import { getKcClsx, type KcClsx } from "keycloakify/login/lib/kcClsx";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFields";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import { useI18n, type I18n } from "../i18n";

type RegisterProps = PageProps<Extract<KcContext, { pageId: "register.ftl" }>> & {
    UserProfileFormFields: LazyOrNot<(props: UserProfileFormFieldsProps) => JSX.Element>;
};

export default function Register(props: RegisterProps) {
    const { kcContext, doUseDefaultCss, Template, classes, UserProfileFormFields } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { url, messagesPerField, recaptchaRequired, recaptchaSiteKey, termsAcceptanceRequired } = kcContext;

    const i18n = useI18n({ kcContext });
    const { msg, msgStr } = i18n;

    const [isFormSubmittable, setIsFormSubmittable] = useState(false);

    return (
        <Template kcContext={kcContext} doUseDefaultCss={doUseDefaultCss} classes={classes} headerNode={msg("registerTitle")} displayRequiredFields>
            <form id="kc-register-form" className={kcClsx("kcFormClass")} action={url.registrationAction} method="post">
                <UserProfileFormFields kcContext={kcContext} kcClsx={kcClsx} onIsFormSubmittableValueChange={setIsFormSubmittable} />
                {termsAcceptanceRequired && <TermsAcceptance i18n={i18n} kcClsx={kcClsx} messagesPerField={messagesPerField} />}
                {recaptchaRequired && (
                    <div className="form-group">
                        <div className={kcClsx("kcInputWrapperClass")}>
                            <div className="g-recaptcha" data-size="compact" data-sitekey={recaptchaSiteKey}></div>
                        </div>
                    </div>
                )}
                <div className={kcClsx("kcFormGroupClass")}>
                    <div id="kc-form-options" className={kcClsx("kcFormOptionsClass")}>
                        <div className={kcClsx("kcFormOptionsWrapperClass")}>
                            <span>
                                <a href={url.loginUrl}>{msg("backToLogin")}</a>
                            </span>
                        </div>
                    </div>
                    <div id="kc-form-buttons" className={kcClsx("kcFormButtonsClass")}>
                        <input
                            disabled={!isFormSubmittable}
                            className={kcClsx("kcButtonClass", "kcButtonPrimaryClass", "kcButtonBlockClass", "kcButtonLargeClass")}
                            type="submit"
                            value={msgStr("doRegister")}
                        />
                    </div>
                </div>
            </form>
        </Template>
    );
}

function TermsAcceptance(props: { i18n: I18n; kcClsx: KcClsx; messagesPerField: Pick<KcContext["messagesPerField"], "existsError" | "get"> }) {
    const { i18n, kcClsx, messagesPerField } = props;

    const { msg } = i18n;

    // NOTE: Refer to https://docs.keycloakify.dev/terms-and-conditions to load your terms and conditions.
    const { termsMarkdown } = useTermsMarkdown();

    if (termsMarkdown === undefined) {
        return null;
    }

    return (
        <>
            <div className="form-group">
                <div className={kcClsx("kcInputWrapperClass")}>
                    {msg("termsTitle")}
                    <div id="kc-registration-terms-text">
                        <Markdown>{termsMarkdown}</Markdown>
                    </div>
                </div>
            </div>
            <div className="form-group">
                <div className={kcClsx("kcLabelWrapperClass")}>
                    <input
                        type="checkbox"
                        id="termsAccepted"
                        name="termsAccepted"
                        className={kcClsx("kcCheckboxInputClass")}
                        aria-invalid={messagesPerField.existsError("termsAccepted")}
                    />
                    <label htmlFor="termsAccepted" className={kcClsx("kcLabelClass")}>
                        {msg("acceptTerms")}
                    </label>
                </div>
                {messagesPerField.existsError("termsAccepted") && (
                    <div className={kcClsx("kcLabelWrapperClass")}>
                        <span id="input-error-terms-accepted" className={kcClsx("kcInputErrorMessageClass")} aria-live="polite">
                            {messagesPerField.get("termsAccepted")}
                        </span>
                    </div>
                )}
            </div>
        </>
    );
}
