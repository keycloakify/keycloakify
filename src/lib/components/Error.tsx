import React, { memo } from "react";
import DefaultTemplate from "./Template";
import type { TemplateProps } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import type { I18n } from "../i18n";

export type ErrorProps = KcProps & {
    kcContext: KcContextBase.Error;
    i18n: I18n;
    doFetchDefaultThemeResources?: boolean;
    Template?: (props: TemplateProps) => JSX.Element | null;
};

const Error = memo((props: ErrorProps) => {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template = DefaultTemplate, ...kcProps } = props;

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
});

export default Error;
