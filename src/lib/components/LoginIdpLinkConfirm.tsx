import React, { memo } from "react";
import Template from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { useCssAndCx } from "tss-react";
import type { I18n } from "../i18n";

const LoginIdpLinkConfirm = memo(({ kcContext, i18n, ...props }: { kcContext: KcContextBase.LoginIdpLinkConfirm; i18n: I18n } & KcProps) => {
    const { url, idpAlias } = kcContext;

    const { msg } = i18n;

    const { cx } = useCssAndCx();

    return (
        <Template
            {...{ kcContext, i18n, ...props }}
            doFetchDefaultThemeResources={true}
            headerNode={msg("confirmLinkIdpTitle")}
            formNode={
                <form id="kc-register-form" action={url.loginAction} method="post">
                    <div className={cx(props.kcFormGroupClass)}>
                        <button
                            type="submit"
                            className={cx(props.kcButtonClass, props.kcButtonDefaultClass, props.kcButtonBlockClass, props.kcButtonLargeClass)}
                            name="submitAction"
                            id="updateProfile"
                            value="updateProfile"
                        >
                            {msg("confirmLinkIdpReviewProfile")}
                        </button>
                        <button
                            type="submit"
                            className={cx(props.kcButtonClass, props.kcButtonDefaultClass, props.kcButtonBlockClass, props.kcButtonLargeClass)}
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
