
import { memo } from "react";
import { Template } from "./Template";
import type { KcProps } from "./KcProps";
import { assert } from "../tools/assert";
import { kcContext } from "../kcContext";
import { useKcMessage } from "../i18n/useKcMessage";

export const Info = memo((props: KcProps) => {

    const { msg } = useKcMessage();

    assert(
        kcContext !== undefined &&
        kcContext.pageId === "info.ftl" &&
        kcContext.message !== undefined
    );

    const {
        messageHeader,
        message,
        requiredActions,
        skipLink,
        pageRedirectUri,
        actionUri,
        client
    } = kcContext;

    return (
        <Template
            {...props}
            displayMessage={false}
            headerNode={
                messageHeader !== undefined ?
                    <>{messageHeader}</>
                    :
                    <>{message.summary}</>
            }
            formNode={
                <div id="kc-info-message">
                    <p className="instruction">{message.summary}

                        {
                            requiredActions !== undefined &&
                            <b>
                                {
                                    requiredActions
                                        .map(requiredAction => msg(`requiredAction.${requiredAction}` as const))
                                        .join(",")
                                }

                            </b>

                        }

                    </p>
                    {
                        !skipLink &&
                            pageRedirectUri !== undefined ?
                            <p><a href="${pageRedirectUri}">${(msg("backToApplication"))}</a></p>
                            :
                            actionUri !== undefined ?
                                <p><a href="${actionUri}">${msg("proceedWithAction")}</a></p>
                                :
                                client.baseUrl !== undefined &&
                                <p><a href="${client.baseUrl}">${msg("backToApplication")}</a></p>
                    }
                </div>


            }
        />
    );
});


