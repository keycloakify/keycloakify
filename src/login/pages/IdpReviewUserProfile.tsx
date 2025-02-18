import type { JSX } from "keycloakify/tools/JSX";
import { FormEvent, useState } from "react";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { FormData } from "../lib/getUserProfileApi";

type IdpReviewUserProfileProps = PageProps<Extract<KcContext, { pageId: "idp-review-user-profile.ftl" }>, I18n> & {
    UserProfileFormFields: LazyOrNot<(props: UserProfileFormFieldsProps) => JSX.Element>;
    doMakeUserConfirmPassword: boolean;
};

export default function IdpReviewUserProfile(props: IdpReviewUserProfileProps) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes, UserProfileFormFields, doMakeUserConfirmPassword } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { msg, msgStr } = i18n;

    const { url, messagesPerField } = kcContext;

    const [formData, setFormData] = useState<FormData>({
        mode: "disabledButton",
        isFormSubmittable: false,
        onFormSubmit: null
    });

    const handleFormSubmit = (evt: FormEvent<HTMLFormElement>) => {
        const { onFormSubmit } = formData;
        if (onFormSubmit) {
            onFormSubmit(evt);
        }
    };

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={messagesPerField.exists("global")}
            displayRequiredFields
            headerNode={msg("loginIdpReviewProfileTitle")}
        >
            <form
                id="kc-idp-review-profile-form"
                className={kcClsx("kcFormClass")}
                action={url.loginAction}
                method="post"
                onSubmit={handleFormSubmit}
            >
                <UserProfileFormFields
                    kcContext={kcContext}
                    i18n={i18n}
                    kcClsx={kcClsx}
                    doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                    onFormData={setFormData}
                    mode={formData.mode}
                />
                <div className={kcClsx("kcFormGroupClass")}>
                    <div id="kc-form-options" className={kcClsx("kcFormOptionsClass")}>
                        <div className={kcClsx("kcFormOptionsWrapperClass")} />
                    </div>
                    <div id="kc-form-buttons" className={kcClsx("kcFormButtonsClass")}>
                        <input
                            className={kcClsx("kcButtonClass", "kcButtonPrimaryClass", "kcButtonBlockClass", "kcButtonLargeClass")}
                            type="submit"
                            value={msgStr("doSubmit")}
                            disabled={!formData?.isFormSubmittable}
                        />
                    </div>
                </div>
            </form>
        </Template>
    );
}
