import React, { useState, memo } from "react";
import Template from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { useCssAndCx } from "../tools/useCssAndCx";
import type { I18n } from "../i18n";
import { UserProfileFormFields } from "./shared/UserProfileCommons";

const LoginUpdateProfile = memo(({ kcContext, i18n, ...props }: { kcContext: KcContextBase.UpdateUserProfile; i18n: I18n } & KcProps) => {
    const { cx } = useCssAndCx();

    const { msg, msgStr } = i18n;

    const { url, isAppInitiatedAction } = kcContext;

    const [isFomSubmittable, setIsFomSubmittable] = useState(false);

    return (
        <Template
            {...{ kcContext, i18n, ...props }}
            doFetchDefaultThemeResources={true}
            headerNode={msg("loginProfileTitle")}
            formNode={
                <form id="kc-update-profile-form" className={cx(props.kcFormClass)} action={url.loginAction} method="post">
                    <UserProfileFormFields
                        kcContext={kcContext}
                        doInsertPasswordFields={true}
                        onIsFormSubmittableValueChange={setIsFomSubmittable}
                        i18n={i18n}
                        {...props}
                    />

                    <div className={cx(props.kcFormGroupClass)}>
                        <div id="kc-form-options" className={cx(props.kcFormOptionsClass)}>
                            <div className={cx(props.kcFormOptionsWrapperClass)}></div>
                        </div>

                        <div id="kc-form-buttons" className={cx(props.kcFormButtonsClass)}>
                            {isAppInitiatedAction ? (
                                <>
                                    <input
                                        className={cx(props.kcButtonClass, props.kcButtonPrimaryClass, props.kcButtonLargeClass)}
                                        type="submit"
                                        value={msgStr("doSubmit")}
                                    />
                                    <button
                                        className={cx(props.kcButtonClass, props.kcButtonDefaultClass, props.kcButtonLargeClass)}
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
                                    className={cx(
                                        props.kcButtonClass,
                                        props.kcButtonPrimaryClass,
                                        props.kcButtonBlockClass,
                                        props.kcButtonLargeClass
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
});

export default LoginUpdateProfile;
