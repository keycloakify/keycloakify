import { memo } from "react";
import { Template } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import type { I18n } from "../i18n";
import { useCssAndCx } from "tss-react";

export const LoginIdpLinkConfirm = memo(
    ({ kcContext, useI18n, ...props }: { kcContext: KcContextBase.LoginIdpLinkConfirm; useI18n: () => I18n } & KcProps) => {
        const { url, idpAlias } = kcContext;

        const { msg } = useI18n();

        const { cx } = useCssAndCx();

        return (
            <Template
                {...{ kcContext, useI18n, ...props }}
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
    },
);
