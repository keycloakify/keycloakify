import React, { memo } from "react";
import Template from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import type { I18n } from "../i18n";

const LoginVerifyEmail = memo(
    ({
        kcContext,
        i18n,
        doFetchDefaultThemeResources = true,
        ...props
    }: { kcContext: KcContextBase.LoginVerifyEmail; i18n: I18n; doFetchDefaultThemeResources?: boolean } & KcProps) => {
        const { msg } = i18n;

        const { url, user } = kcContext;

        return (
            <Template
                {...{ kcContext, i18n, doFetchDefaultThemeResources, ...props }}
                displayMessage={false}
                headerNode={msg("emailVerifyTitle")}
                formNode={
                    <>
                        <p className="instruction">{msg("emailVerifyInstruction1", user?.email)}</p>
                        <p className="instruction">
                            {msg("emailVerifyInstruction2")}
                            <br />
                            <a href={url.loginAction}>{msg("doClickHere")}</a>
                            &nbsp;
                            {msg("emailVerifyInstruction3")}
                        </p>
                    </>
                }
            />
        );
    }
);

export default LoginVerifyEmail;
