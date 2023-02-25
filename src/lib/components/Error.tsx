import React from "react";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import type { PageProps } from "./shared/KcProps";
import type { I18nBase } from "../i18n";

export default function Error(props: PageProps<KcContextBase.Error, I18nBase>) {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template, ...kcProps } = props;

    const { message, client } = kcContext;

    const { msg } = i18n;

    return (
        <Template
            {...{ kcContext, i18n, doFetchDefaultThemeResources, ...kcProps }}
            displayMessage={false}
            headerNode={msg("errorTitle")}
            formNode={
                <div id="kc-error-message">
                    <p className="instruction">{message.summary}</p>
                    {client !== undefined && client.baseUrl !== undefined && (
                        <p>
                            <a id="backToApplication" href={client.baseUrl}>
                                {msg("backToApplication")}
                            </a>
                        </p>
                    )}
                </div>
            }
        />
    );
}
