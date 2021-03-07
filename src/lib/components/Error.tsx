
import { memo } from "react";
import { Template } from "./Template";
import type { KcProps } from "./KcProps";
import { assert } from "../tools/assert";
import type { KcContext } from "../KcContext";
import { useKcMessage } from "../i18n/useKcMessage";

export const Error = memo(({ kcContext, ...props }: { kcContext: KcContext.Error; } & KcProps) => {

    const { msg } = useKcMessage();

    assert(kcContext.message !== undefined);

    const { message, client } = kcContext;

    return (
        <Template
            {...{ kcContext, ...props }}
            displayMessage={false}
            headerNode={msg("errorTitle")}
            formNode={
                <div id="kc-error-message">
                    <p className="instruction">{message.summary}</p>
                    {
                        client !== undefined && client.baseUrl !== undefined &&
                        <p>
                            <a id="backToApplication" href={client.baseUrl}>
                                {msg("backToApplication")}
                            </a>
                        </p>
                    }
                </div>
            }
        />
    );
});


