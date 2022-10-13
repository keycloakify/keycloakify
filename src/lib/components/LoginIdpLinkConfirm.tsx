import React, { memo } from "react";
import DefaultTemplate from "./Template";
import type { TemplateProps } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { useCssAndCx } from "../tools/useCssAndCx";
import type { I18n } from "../i18n";

export type LoginIdpLinkConfirmProps = KcProps & {
    kcContext: KcContextBase.LoginIdpLinkConfirm;
    i18n: I18n;
    doFetchDefaultThemeResources?: boolean;
    Template?: (props: TemplateProps) => JSX.Element | null;
};

const LoginIdpLinkConfirm = memo((props: LoginIdpLinkConfirmProps) => {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template = DefaultTemplate, ...kcProps } = props;

    const { url, idpAlias } = kcContext;

    const { msg } = i18n;

    const { cx } = useCssAndCx();

    return (
        <Template
            {...{ kcContext, i18n, doFetchDefaultThemeResources, ...kcProps }}
            headerNode={msg("confirmLinkIdpTitle")}
            formNode={
                <form id="kc-register-form" action={url.loginAction} method="post">
                    <div className={cx(kcProps.kcFormGroupClass)}>
                        <button
                            type="submit"
                            className={cx(
                                kcProps.kcButtonClass,
                                kcProps.kcButtonDefaultClass,
                                kcProps.kcButtonBlockClass,
                                kcProps.kcButtonLargeClass
                            )}
                            name="submitAction"
                            id="updateProfile"
                            value="updateProfile"
                        >
                            {msg("confirmLinkIdpReviewProfile")}
                        </button>
                        <button
                            type="submit"
                            className={cx(
                                kcProps.kcButtonClass,
                                kcProps.kcButtonDefaultClass,
                                kcProps.kcButtonBlockClass,
                                kcProps.kcButtonLargeClass
                            )}
                            name="submitAction"
                            id="linkAccount"
                            value="linkAccount"
                        >
                            {msg("confirmLinkIdpContinue", idpAlias)}
                        </button>
                    </div>
                </form>
            }
        />
    );
});

export default LoginIdpLinkConfirm;
