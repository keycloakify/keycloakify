//import { useState } from "react";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import { getKcClsx, /* type KcClsx */ } from "keycloakify/login/lib/kcClsx";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import './Register.scss';

type RegisterProps = PageProps<Extract<KcContext, { pageId: "register.ftl" }>, I18n> & {
    UserProfileFormFields: LazyOrNot<(props: UserProfileFormFieldsProps) => JSX.Element>;
    doMakeUserConfirmPassword: boolean;
};

export default function Register(props: RegisterProps) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes, /* UserProfileFormFields, doMakeUserConfirmPassword */ } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { url, messagesPerField/* , recaptchaRequired, recaptchaSiteKey, termsAcceptanceRequired  */} = kcContext;

    /* const { msg, msgStr } = i18n; */

  /*   const [isFormSubmittable, setIsFormSubmittable] = useState(false); */

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            headerNode={""}
            displayMessage={messagesPerField.exists("global")}
            displayRequiredFields
        >
            {/* <form id="kc-register-form" className={kcClsx("kcFormClass")} action={url.registrationAction} method="post">
                <UserProfileFormFields
                    kcContext={kcContext}
                    i18n={i18n}
                    kcClsx={kcClsx}
                    onIsFormSubmittableValueChange={setIsFormSubmittable}
                    doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                />
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
            </form> */}
            <div className="login-text">
                Already have an account? <a href={url.loginUrl}>Log In Now</a>
            </div>
            <div className="create-container">
                <div className="header">
                    Create Account
                </div>
                <div className="user-info">
                    User Information
                </div>
                <div className="create-fields">
                    <div style={{width:'46%'}}>
                        <label className={kcClsx("kcLabelClass")}>
                            Name
                        </label>
                        <input
                            tabIndex={1}
                            className={kcClsx("kcInputClass")}
                            defaultValue={""}
                            type="text"
                            autoFocus={true}
                            autoComplete="off"
                        />
                    </div>
                    <div style={{width:'45%'}}>
                        <label className={kcClsx("kcLabelClass")}>
                            Last Name
                        </label>
                        <input
                            tabIndex={1}
                            className={kcClsx("kcInputClass")}
                            defaultValue={""}
                            type="text"
                            autoFocus={true}
                            autoComplete="off"
                        />
                    </div>
                    <div style={{width:'100%'}}>
                        <label className={kcClsx("kcLabelClass")}>
                            Email
                        </label>
                        <input
                            tabIndex={1}
                            className={kcClsx("kcInputClass")}
                            defaultValue={""}
                            type="text"
                            autoFocus={true}
                            autoComplete="off"
                        />
                    </div>
                    <div style={{width:'100%'}}>
                        <label className={kcClsx("kcLabelClass")}>
                            Password
                        </label>
                        <input
                            tabIndex={1}
                            className={kcClsx("kcInputClass")}
                            defaultValue={""}
                            type="password"
                            autoFocus={true}
                            autoComplete="off"
                        />
                    </div>
                    <div style={{width:'100%'}}> 
                        <label className={kcClsx("kcLabelClass")}>
                            Confirm Password
                        </label>
                        <input
                            tabIndex={1}
                            className={kcClsx("kcInputClass")}
                            defaultValue={""}
                            type="password"
                            autoFocus={true}
                            autoComplete="off"
                        />
                    </div>
                </div>
                <div className="button-create-section">
                    <button className="button-create">
                        Create Account
                    </button>
                </div>
            </div>
        </Template>
    );
}

/* function TermsAcceptance(props: { i18n: I18n; kcClsx: KcClsx; messagesPerField: Pick<KcContext["messagesPerField"], "existsError" | "get"> }) {
    const { i18n, kcClsx, messagesPerField } = props;

    const { msg } = i18n;

    return (
        <>
            <div className="form-group">
                <div className={kcClsx("kcInputWrapperClass")}>
                    {msg("termsTitle")}
                    <div id="kc-registration-terms-text">{msg("termsText")}</div>
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
} */
