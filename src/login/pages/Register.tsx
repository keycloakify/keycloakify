import { useState } from "react";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
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
    const { kcContext, i18n, doUseDefaultCss, Template, classes, UserProfileFormFields, doMakeUserConfirmPassword } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { url, messagesPerField } = kcContext;

    const [isFormSubmittable, setIsFormSubmittable] = useState(false);

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
            <form
                id="kc-register-form"
                className={kcClsx("kcFormClass")}
                action={url.registrationAction}
                method="post"
            >
                <div className="login-text">
                    Already have an account?  <a style={{ marginLeft: '30px' }} href={url.loginUrl}> Log In Now</a>
                </div>
                <div className="create-container">
                    <div className="header">
                        Create Account
                    </div>
                    <div className="user-info">
                        User Information
                    </div>
                    <div className="create-fields">
                        <UserProfileFormFields
                            kcContext={kcContext}
                            i18n={i18n}
                            kcClsx={kcClsx}
                            onIsFormSubmittableValueChange={setIsFormSubmittable}
                            doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                        />
                    </div>
                    <div id="kc-form-buttons" className="button-create-section">
                        <input
                            disabled={!isFormSubmittable}
                            className="button-create"
                            type="submit"
                            value="Create Account"
                        />
                    </div>
                </div>
            </form>
        </Template>
    );
}