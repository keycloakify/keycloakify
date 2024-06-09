import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import { useI18n } from "../i18n";

export default function Error(props: PageProps<Extract<KcContext, { pageId: "error.ftl" }>>) {
    const { kcContext, doUseDefaultCss, Template, classes } = props;

    const { message, client, skipLink } = kcContext;

    const { msg } = useI18n({ kcContext });

    return (
        <Template {...{ kcContext, doUseDefaultCss, classes }} displayMessage={false} headerNode={msg("errorTitle")}>
            <div id="kc-error-message">
                <p className="instruction">{message.summary}</p>
                {!skipLink && client !== undefined && client.baseUrl !== undefined && (
                    <p>
                        <a id="backToApplication" href={client.baseUrl}>
                            {msg("backToApplication")}
                        </a>
                    </p>
                )}
            </div>
        </Template>
    );
}
