import { memo } from "react";
import { Template } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import type { I18n } from "../i18n";

export const Error = memo(({ kcContext, useI18n, ...props }: { kcContext: KcContextBase.Error; useI18n: () => I18n } & KcProps) => {
    const { msg } = useI18n();

    const { message, client } = kcContext;

    return (
        <Template
            {...{ kcContext, useI18n, ...props }}
            doFetchDefaultThemeResources={true}
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
