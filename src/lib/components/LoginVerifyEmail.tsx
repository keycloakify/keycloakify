
import { memo } from "react";
import { Template } from "./Template";
import type { KcProps } from "./KcProps";
import { assert } from "../tools/assert";
import { kcContext } from "../kcContext";
import { useKcMessage } from "../i18n/useKcMessage";

export const LoginVerifyEmail = memo((props: KcProps) => {

    const { msg } = useKcMessage();

    assert(
        kcContext !== undefined &&
        kcContext.pageId === "login-verify-email.ftl"
    );

    const {
        url
    } = kcContext;

    return (
        <Template
            {...props}
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


