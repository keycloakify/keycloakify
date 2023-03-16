import React, { useState } from "react";
import { clsx } from "../tools/clsx";
import { UserProfileFormFields } from "./shared/UserProfileCommons";
import type { PageProps } from "../KcProps";
import type { KcContextBase } from "../kcContext";
import type { I18nBase } from "../i18n";

export default function IdpReviewUserProfile(props: PageProps<Extract<KcContextBase, { pageId: "idp-review-user-profile.ftl" }>, I18nBase>) {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template, ...kcProps } = props;

    const { msg, msgStr } = i18n;

    const { url } = kcContext;

    const [isFomSubmittable, setIsFomSubmittable] = useState(false);

    return (
        <Template
            {...{ kcContext, i18n, doFetchDefaultThemeResources, ...kcProps }}
            headerNode={msg("loginIdpReviewProfileTitle")}
            formNode={
                <form id="kc-idp-review-profile-form" className={clsx(kcProps.kcFormClass)} action={url.loginAction} method="post">
                    <UserProfileFormFields kcContext={kcContext} onIsFormSubmittableValueChange={setIsFomSubmittable} i18n={i18n} {...kcProps} />

                    <div className={clsx(kcProps.kcFormGroupClass)}>
                        <div id="kc-form-options" className={clsx(kcProps.kcFormOptionsClass)}>
                            <div className={clsx(kcProps.kcFormOptionsWrapperClass)} />
                        </div>
                        <div id="kc-form-buttons" className={clsx(kcProps.kcFormButtonsClass)}>
                            <input
                                className={clsx(
                                    kcProps.kcButtonClass,
                                    kcProps.kcButtonPrimaryClass,
                                    kcProps.kcButtonBlockClass,
                                    kcProps.kcButtonLargeClass
                                )}
                                type="submit"
                                value={msgStr("doSubmit")}
                                disabled={!isFomSubmittable}
                            />
                        </div>
                    </div>
                </form>
            }
        />
    );
}
