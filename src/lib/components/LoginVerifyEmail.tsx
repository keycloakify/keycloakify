
import { memo } from "react";
import { Template } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContext } from "../KcContext";
import { useKcMessage } from "../i18n/useKcMessage";

export const LoginVerifyEmail = memo(({ kcContext, ...props }: { kcContext: KcContext.LoginVerifyEmail; } & KcProps) => {

    const { msg } = useKcMessage();

    const {
        url
    } = kcContext;

    return (
        <Template
            {...{ kcContext, ...props }}
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


