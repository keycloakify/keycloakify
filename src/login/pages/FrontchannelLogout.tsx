import { useEffect } from "react";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function FrontchannelLogout(props: PageProps<Extract<KcContext, { pageId: "frontchannel-logout.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { logout } = kcContext;

    const { msg, msgStr } = i18n;

    useEffect(() => {
        const { logoutRedirectUri } = logout;

        if (logoutRedirectUri === undefined) {
            return;
        }

        if (document.readyState === "complete") {
            window.location.replace(logoutRedirectUri);
            return;
        }

        const onReadystatechange = () => {
            if (document.readyState === "complete") {
                window.location.replace(logoutRedirectUri);
            }
        };

        document.addEventListener("readystatechange", onReadystatechange);

        return () => {
            document.removeEventListener("readystatechange", onReadystatechange);
        };
    }, []);

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
                        <iframe src={client.frontChannelLogoutUrl} style={{ display: "none" }} />
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
