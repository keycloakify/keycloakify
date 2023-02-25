import React from "react";
import { clsx } from "../tools/clsx";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import type { PageProps } from "./shared/KcProps";
import type { I18nBase } from "../i18n";

export default function LoginIdpLinkConfirm(props: PageProps<KcContextBase.LoginIdpLinkConfirm, I18nBase>) {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template, ...kcProps } = props;

    const { url, idpAlias } = kcContext;

    const { msg } = i18n;

    return (
        <Template
            {...{ kcContext, i18n, doFetchDefaultThemeResources, ...kcProps }}
            headerNode={msg("confirmLinkIdpTitle")}
            formNode={
                <form id="kc-register-form" action={url.loginAction} method="post">
                    <div className={clsx(kcProps.kcFormGroupClass)}>
                        <button
                            type="submit"
                            className={clsx(
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
                            className={clsx(
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
}
