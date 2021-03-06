
import { memo } from "react";
import { Template } from "./Template";
import type { KcProps } from "./KcProps";
import { assert } from "../tools/assert";
import { kcContext } from "../kcContext";
import { useKcTranslation } from "../i18n/useKcTranslation";

export const Info = memo((props: KcProps) => {

    const { t } = useKcTranslation();

    assert(
        kcContext !== undefined &&
        kcContext.pageBasename === "info.ftl" &&
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
                                        .map(requiredAction => t(`requiredAction.${requiredAction}` as const))
                                        .join(",")
                                }

                            </b>

                        }

                    </p>
                    {
                        !skipLink &&
                            pageRedirectUri !== undefined ?
                            <p><a href="${pageRedirectUri}">${(t("backToApplication"))}</a></p>
                            :
                            actionUri !== undefined ?
                                <p><a href="${actionUri}">${t("proceedWithAction")}</a></p>
                                :
                                client.baseUrl !== undefined &&
                                <p><a href="${client.baseUrl}">${t("backToApplication")}</a></p>
                    }
                </div>


            }
        />
    );
});


