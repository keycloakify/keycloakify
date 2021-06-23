
import { memo } from "react";
import { Template } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { useKcMessage } from "../i18n/useKcMessage";

export const LoginVerifyEmail = memo(({ kcContext, ...props }: { kcContext: KcContextBase.LoginVerifyEmail; } & KcProps) => {

    const { msg } = useKcMessage();

    const {
        url
    } = kcContext;

    return (
        <Template
            {...{ kcContext, ...props }}
            doFetchDefaultThemeResources={true}
            displayMessage={false}
            headerNode={msg("emailVerifyTitle")}
            formNode={
                <>
                    <p className="instruction">
                        {msg("emailVerifyInstruction1")}
                    </p>
                    <p className="instruction">
                        {msg("emailVerifyInstruction2")}
                        <a href={url.loginAction}>{msg("doClickHere")}</a>
                        {msg("emailVerifyInstruction3")}
                    </p>
                </>
            }
        />
    );

});


