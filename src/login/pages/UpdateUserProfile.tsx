import { useState } from "react";
import { clsx } from "keycloakify/tools/clsx";
import { UserProfileFormFields } from "keycloakify/login/pages/shared/UserProfileCommons";
import { type PageProps, defaultClasses } from "keycloakify/login/pages/PageProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";

export default function UpdateUserProfile(props: PageProps<Extract<KcContext, { pageId: "update-user-profile.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({
        "defaultClasses": !doUseDefaultCss ? undefined : defaultClasses,
        classes
    });

    const { msg, msgStr } = i18n;

    const { url, isAppInitiatedAction } = kcContext;

    const [isFomSubmittable, setIsFomSubmittable] = useState(false);

    return (
        <Template
            {...{ kcContext, i18n, doUseDefaultCss, classes }}
            headerNode={msg("loginProfileTitle")}
            formNode={
                <form id="kc-update-profile-form" className={getClassName("kcFormClass")} action={url.loginAction} method="post">
                    <UserProfileFormFields
                        kcContext={kcContext}
                        onIsFormSubmittableValueChange={setIsFomSubmittable}
                        i18n={i18n}
                        getClassName={getClassName}
                    />

                    <div className={getClassName("kcFormGroupClass")}>
                        <div id="kc-form-options" className={getClassName("kcFormOptionsClass")}>
                            <div className={getClassName("kcFormOptionsWrapperClass")}></div>
                        </div>

                        <div id="kc-form-buttons" className={getClassName("kcFormButtonsClass")}>
                            {isAppInitiatedAction ? (
                                <>
                                    <input
                                        className={clsx(
                                            getClassName("kcButtonClass"),
                                            getClassName("kcButtonPrimaryClass"),
                                            getClassName("kcButtonLargeClass")
                                        )}
                                        type="submit"
                                        value={msgStr("doSubmit")}
                                    />
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
                                </>
                            ) : (
                                <input
                                    className={clsx(
                                        getClassName("kcButtonClass"),
                                        getClassName("kcButtonPrimaryClass"),
                                        getClassName("kcButtonBlockClass"),
                                        getClassName("kcButtonLargeClass")
                                    )}
                                    type="submit"
                                    defaultValue={msgStr("doSubmit")}
                                    disabled={!isFomSubmittable}
                                />
                            )}
                        </div>
                    </div>
                </form>
            }
        />
    );
}
