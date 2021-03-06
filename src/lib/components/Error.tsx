
import { memo } from "react";
import { Template } from "./Template";
import type { KcProps } from "./KcProps";
import { assert } from "../tools/assert";
import { kcContext } from "../kcContext";
import { useKcTranslation } from "../i18n/useKcTranslation";

export const Error = memo((props: KcProps) => {

    const { t } = useKcTranslation();

    assert(
        kcContext !== undefined &&
        kcContext.pageId === "error.ftl" &&
        kcContext.message !== undefined
    );

    const { message, client } = kcContext;

    return (
        <Template
            {...props}
            displayMessage={false}
            headerNode={t("errorTitle")}
            formNode={
                <div id="kc-error-message">
                    <p className="instruction">{message.summary}</p>
                    {
                        client !== undefined && client.baseUrl !== undefined &&
                        <p>
                            <a id="backToApplication" href={client.baseUrl}>
                                {t("backToApplication")}
                            </a>
                        </p>
                    }
                </div>
            }
        />
    );
});


