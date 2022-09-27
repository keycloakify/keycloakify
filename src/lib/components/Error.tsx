import React, { memo } from "react";
import Template from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import type { I18n } from "../i18n";

const Error = memo(
    ({
        kcContext,
        i18n,
        doFetchDefaultThemeResources = true,
        ...props
    }: { kcContext: KcContextBase.Error; i18n: I18n; doFetchDefaultThemeResources?: boolean } & KcProps) => {
        const { message, client } = kcContext;

        const { msg } = i18n;

        return (
            <Template
                {...{ kcContext, i18n, doFetchDefaultThemeResources, ...props }}
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
);

export default Error;
