import { memo } from "react";
import { Template } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { useKcMessage } from "../i18n/useKcMessage";

export const LoginPageExpired = memo(({ kcContext, ...props }: { kcContext: KcContextBase.LoginPageExpired } & KcProps) => {
    const { url } = kcContext;

    const { msg } = useKcMessage();

    return (
        <Template
            {...{ kcContext, ...props }}
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
});
