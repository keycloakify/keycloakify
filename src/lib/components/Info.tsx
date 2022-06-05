import { memo } from "react";
import { Template } from "./Template";
import type { KcProps } from "./KcProps";
import { assert } from "../tools/assert";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import type { I18n } from "../i18n";

export const Info = memo(({ kcContext, useI18n, ...props }: { kcContext: KcContextBase.Info; useI18n: () => I18n } & KcProps) => {
    assert(kcContext.message !== undefined);

    const { messageHeader, message, requiredActions, skipLink, pageRedirectUri, actionUri, client } = kcContext;

    const { msg } = useI18n();

    return (
        <Template
            {...{ kcContext, useI18n, ...props }}
            doFetchDefaultThemeResources={true}
            displayMessage={false}
            headerNode={messageHeader !== undefined ? <>{messageHeader}</> : <>{message.summary}</>}
            formNode={
                <div id="kc-info-message">
                    <p className="instruction">
                        {message.summary}

                        {requiredActions !== undefined && (
                            <b>{requiredActions.map(requiredAction => msg(`requiredAction.${requiredAction}` as const)).join(",")}</b>
                        )}
                    </p>
                    {!skipLink && pageRedirectUri !== undefined ? (
                        <p>
                            <a href={pageRedirectUri}>{msg("backToApplication")}</a>
                        </p>
                    ) : actionUri !== undefined ? (
                        <p>
                            <a href={actionUri}>{msg("proceedWithAction")}</a>
                        </p>
                    ) : (
                        client.baseUrl !== undefined && (
                            <p>
                                <a href={client.baseUrl}>{msg("backToApplication")}</a>
                            </p>
                        )
                    )}
                </div>
            }
        />
    );
});
