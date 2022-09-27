import React, { memo } from "react";
import Template from "./Template";
import type { KcProps } from "./KcProps";
import { assert } from "../tools/assert";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import type { I18n } from "../i18n";

const Info = memo(
    ({
        kcContext,
        i18n,
        doFetchDefaultThemeResources = true,
        ...props
    }: { kcContext: KcContextBase.Info; i18n: I18n; doFetchDefaultThemeResources?: boolean } & KcProps) => {
        const { msgStr, msg } = i18n;

        assert(kcContext.message !== undefined);

        const { messageHeader, message, requiredActions, skipLink, pageRedirectUri, actionUri, client } = kcContext;

        return (
            <Template
                {...{ kcContext, i18n, doFetchDefaultThemeResources, ...props }}
                displayMessage={false}
                headerNode={messageHeader !== undefined ? <>{messageHeader}</> : <>{message.summary}</>}
                formNode={
                    <div id="kc-info-message">
                        <p className="instruction">
                            {message.summary}

                            {requiredActions !== undefined && (
                                <b>{requiredActions.map(requiredAction => msgStr(`requiredAction.${requiredAction}` as const)).join(",")}</b>
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
    }
);

export default Info;
