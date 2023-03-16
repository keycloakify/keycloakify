import React from "react";
import type { PageProps } from "../KcProps";
import type { KcContextBase } from "../kcContext";
import type { I18nBase } from "../i18n";

export default function LoginPageExpired(props: PageProps<Extract<KcContextBase, { pageId: "login-page-expired.ftl" }>, I18nBase>) {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template, ...kcProps } = props;

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
}
