import { memo } from "react";
import { Template } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import type { I18n } from "../i18n";

export const LoginPageExpired = memo(
    ({ kcContext, useI18n, ...props }: { kcContext: KcContextBase.LoginPageExpired; useI18n: () => I18n } & KcProps) => {
        const { url } = kcContext;

        const { msg } = useI18n();

        return (
            <Template
                {...{ kcContext, useI18n, ...props }}
                doFetchDefaultThemeResources={true}
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
    },
);
