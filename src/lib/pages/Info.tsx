import React from "react";
import { assert } from "../tools/assert";
import type { KcContextBase } from "../kcContext";
import type { PageProps } from "../KcProps";
import type { I18nBase } from "../i18n";

export default function Info(props: PageProps<KcContextBase.Info, I18nBase>) {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template, ...kcProps } = props;

    const { msgStr, msg } = i18n;

    assert(kcContext.message !== undefined);

    const { messageHeader, message, requiredActions, skipLink, pageRedirectUri, actionUri, client } = kcContext;

    return (
        <Template
            {...{ kcContext, i18n, doFetchDefaultThemeResources, ...kcProps }}
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
