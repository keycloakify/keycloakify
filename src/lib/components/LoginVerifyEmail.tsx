import { memo } from "react";
import { Template } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import type { I18n } from "../i18n";

export const LoginVerifyEmail = memo(
    ({ kcContext, useI18n, ...props }: { kcContext: KcContextBase.LoginVerifyEmail; useI18n: () => I18n } & KcProps) => {
        const { msg } = useI18n();

        const { url } = kcContext;

        return (
            <Template
                {...{ kcContext, useI18n, ...props }}
                doFetchDefaultThemeResources={true}
                displayMessage={false}
                headerNode={msg("emailVerifyTitle")}
                formNode={
                    <>
                        <p className="instruction">{msg("emailVerifyInstruction1")}</p>
                        <p className="instruction">
                            {msg("emailVerifyInstruction2")}
                            <a href={url.loginAction}>{msg("doClickHere")}</a>
                            {msg("emailVerifyInstruction3")}
                        </p>
                    </>
                }
            />
        );
    },
);
