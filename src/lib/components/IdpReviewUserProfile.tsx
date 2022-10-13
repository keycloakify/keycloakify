import React, { useState, memo } from "react";
import DefaultTemplate from "./Template";
import type { TemplateProps } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { useCssAndCx } from "../tools/useCssAndCx";
import type { I18n } from "../i18n";
import { UserProfileFormFields } from "./shared/UserProfileCommons";

export type IdpReviewUserProfileProps = KcProps & {
    kcContext: KcContextBase.IdpReviewUserProfile;
    i18n: I18n;
    doFetchDefaultThemeResources?: boolean;
    Template?: (props: TemplateProps) => JSX.Element | null;
};

const IdpReviewUserProfile = memo((props: IdpReviewUserProfileProps) => {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template = DefaultTemplate, ...kcProps } = props;

    const { cx } = useCssAndCx();

    const { msg, msgStr } = i18n;

    const { url } = kcContext;

    const [isFomSubmittable, setIsFomSubmittable] = useState(false);

    return (
        <Template
            {...{ kcContext, i18n, doFetchDefaultThemeResources, ...kcProps }}
            headerNode={msg("loginIdpReviewProfileTitle")}
            formNode={
                <form id="kc-idp-review-profile-form" className={cx(kcProps.kcFormClass)} action={url.loginAction} method="post">
                    <UserProfileFormFields kcContext={kcContext} onIsFormSubmittableValueChange={setIsFomSubmittable} i18n={i18n} {...kcProps} />

                    <div className={cx(kcProps.kcFormGroupClass)}>
                        <div id="kc-form-options" className={cx(kcProps.kcFormOptionsClass)}>
                            <div className={cx(kcProps.kcFormOptionsWrapperClass)} />
                        </div>
                        <div id="kc-form-buttons" className={cx(kcProps.kcFormButtonsClass)}>
                            <input
                                className={cx(
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
});

export default IdpReviewUserProfile;
