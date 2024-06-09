import { useState } from "react";
import { clsx } from "keycloakify/tools/clsx";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFields";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import { useI18n, type I18n } from "../i18n";

type UpdateEmailProps = PageProps<Extract<KcContext, { pageId: "update-email.ftl" }>> & {
    UserProfileFormFields: LazyOrNot<(props: UserProfileFormFieldsProps) => JSX.Element>;
};

export default function UpdateEmail(props: UpdateEmailProps) {
    const { kcContext, doUseDefaultCss, Template, classes, UserProfileFormFields } = props;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    const i18n = useI18n({ kcContext });
    const { msg, msgStr } = i18n;

    const [isFormSubmittable, setIsFormSubmittable] = useState(false);

    const { url, messagesPerField, isAppInitiatedAction } = kcContext;

    return (
        <Template
            {...{ kcContext, doUseDefaultCss, classes }}
            displayMessage={messagesPerField.exists("global")}
            displayRequiredFields
            headerNode={msg("updateEmailTitle")}
        >
            <form id="kc-update-email-form" className={getClassName("kcFormClass")} action={url.loginAction} method="post">
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

                    <LogoutOtherSessions {...{ getClassName, i18n }} />

                    <div id="kc-form-buttons" className={getClassName("kcFormButtonsClass")}>
                        <input
                            disabled={!isFormSubmittable}
                            className={clsx(
                                getClassName("kcButtonClass"),
                                getClassName("kcButtonPrimaryClass"),
                                isAppInitiatedAction && getClassName("kcButtonBlockClass"),
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

function LogoutOtherSessions(props: { getClassName: ReturnType<typeof useGetClassName>["getClassName"]; i18n: I18n }) {
    const { getClassName, i18n } = props;

    const { msg } = i18n;

    return (
        <div id="kc-form-options" className={getClassName("kcFormOptionsClass")}>
            <div className={getClassName("kcFormOptionsWrapperClass")}>
                <div className="checkbox">
                    <label>
                        <input type="checkbox" id="logout-sessions" name="logout-sessions" value="on" defaultChecked={true} />
                        {msg("logoutOtherSessions")}
                    </label>
                </div>
            </div>
        </div>
    );
}
