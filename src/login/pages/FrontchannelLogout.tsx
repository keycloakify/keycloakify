import { useEffect, useState } from "react";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function FrontchannelLogout(props: PageProps<Extract<KcContext, { pageId: "frontchannel-logout.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { logout } = kcContext;

    const { msg, msgStr } = i18n;

    const [iframeLoadCount, setIframeLoadCount] = useState(0);

    useEffect(() => {
        if (!kcContext.logout.logoutRedirectUri) {
            return;
        }

        if (iframeLoadCount !== kcContext.logout.clients.length) {
            return;
        }

        window.location.replace(kcContext.logout.logoutRedirectUri);
    }, [iframeLoadCount]);

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            documentTitle={msgStr("frontchannel-logout.title")}
            headerNode={msg("frontchannel-logout.title")}
        >
            <p>{msg("frontchannel-logout.message")}</p>
            <ul>
                {logout.clients.map(client => (
                    <li key={client.name}>
                        {client.name}
                        <iframe
                            src={client.frontChannelLogoutUrl}
                            style={{ display: "none" }}
                            onLoad={() => {
                                setIframeLoadCount(count => count + 1);
                            }}
                        />
                    </li>
                ))}
            </ul>
            {logout.logoutRedirectUri !== undefined && (
                <a id="continue" className="btn btn-primary" href={logout.logoutRedirectUri}>
                    {msg("doContinue")}
                </a>
            )}
        </Template>
    );
}
