import { useState } from "react";
import { clsx } from "keycloakify/tools/clsx";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFields";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import { useI18n } from "../i18n";

type LoginUpdateProfileProps = PageProps<Extract<KcContext, { pageId: "login-update-profile.ftl" }>> & {
    UserProfileFormFields: LazyOrNot<(props: UserProfileFormFieldsProps) => JSX.Element>;
};

export default function LoginUpdateProfile(props: LoginUpdateProfileProps) {
    const { kcContext, doUseDefaultCss, Template, classes, UserProfileFormFields } = props;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    const { url, messagesPerField, isAppInitiatedAction } = kcContext;

    const { msg, msgStr } = useI18n({ kcContext });

    const [isFormSubmittable, setIsFormSubmittable] = useState(false);

    return (
        <Template {...{ kcContext, doUseDefaultCss, classes }} displayRequiredFields headerNode={msg("loginProfileTitle")}>
            <form id="kc-update-profile-form" className={getClassName("kcFormClass")} action={url.loginAction} method="post">
                <UserProfileFormFields
                    {...{
                        kcContext,
                        getClassName,
                        messagesPerField
                    }}
                    onIsFormSubmittableValueChange={setIsFormSubmittable}
                />
                <div className={getClassName("kcFormGroupClass")}>
                    <div id="kc-form-options" className={getClassName("kcFormOptionsClass")}>
                        <div className={getClassName("kcFormOptionsWrapperClass")} />
                    </div>
                    <div id="kc-form-buttons" className={getClassName("kcFormButtonsClass")}>
                        <input
                            disabled={!isFormSubmittable}
                            className={clsx(
                                getClassName("kcButtonClass"),
                                getClassName("kcButtonPrimaryClass"),
                                !isAppInitiatedAction && getClassName("kcButtonBlockClass"),
                                getClassName("kcButtonLargeClass")
                            )}
                            type="submit"
                            value={msgStr("doSubmit")}
                        />
                        {isAppInitiatedAction && (
                            <button
                                className={clsx(
                                    getClassName("kcButtonClass"),
                                    getClassName("kcButtonDefaultClass"),
                                    getClassName("kcButtonLargeClass")
                                )}
                                type="submit"
                                name="cancel-aia"
                                value="true"
                                formNoValidate
                            >
                                {msg("doCancel")}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </Template>
    );
}
