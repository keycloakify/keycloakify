import { memo } from "react";
import { Template } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { getMsg } from "../i18n";

export const LoginVerifyEmail = memo(({ kcContext, ...props }: { kcContext: KcContextBase.LoginVerifyEmail } & KcProps) => {
    const { msg } = getMsg(kcContext);

    const { url } = kcContext;

    return (
        <Template
            {...{ kcContext, ...props }}
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
});
