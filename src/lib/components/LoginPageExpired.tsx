import React, { memo } from "react";
import DefaultTemplate from "./Template";
import type { TemplateProps } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import type { I18n } from "../i18n";

export type LoginPageExpired = KcProps & {
    kcContext: KcContextBase.LoginPageExpired;
    i18n: I18n;
    doFetchDefaultThemeResources?: boolean;
    Template?: (props: TemplateProps) => JSX.Element | null;
};

const LoginPageExpired = memo((props: LoginPageExpired) => {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template = DefaultTemplate, ...kcProps } = props;

    const { url } = kcContext;

    const { msg } = i18n;

    return (
        <Template
            {...{ kcContext, i18n, doFetchDefaultThemeResources, ...kcProps }}
            displayMessage={false}
            headerNode={msg("pageExpiredTitle")}
            formNode={
                <>
                    <p id="instruction1" className="instruction">
                        {msg("pageExpiredMsg1")}
                        <a id="loginRestartLink" href={url.loginRestartFlowUrl}>
                            {msg("doClickHere")}
                        </a>{" "}
                        .<br />
                        {msg("pageExpiredMsg2")}{" "}
                        <a id="loginContinueLink" href={url.loginAction}>
                            {msg("doClickHere")}
                        </a>{" "}
                        .
                    </p>
                </>
            }
        />
    );
});

export default LoginPageExpired;
