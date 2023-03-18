import { type PageProps } from "keycloakify/pages/PageProps";
import type { KcContextBase as KcContext } from "../kcContext";
import type { I18nBase as I18n } from "../i18n";

export default function Error(props: PageProps<Extract<KcContext, { pageId: "error.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { message, client } = kcContext;

    const { msg } = i18n;

    return (
        <Template
            {...{ kcContext, i18n, doUseDefaultCss, classes }}
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
