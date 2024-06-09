import { useEffect } from "react";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import { useI18n } from "../i18n";

export default function FrontchannelLogout(props: PageProps<Extract<KcContext, { pageId: "frontchannel-logout.ftl" }>>) {
    const { kcContext, doUseDefaultCss, Template, classes } = props;

    const { logout } = kcContext;

    const { msg, msgStr } = useI18n({ kcContext });

    useEffect(() => {
        if (logout.logoutRedirectUri) {
            window.location.replace(logout.logoutRedirectUri);
        }
    }, []);

    return (
        <Template
            {...{ kcContext, doUseDefaultCss, classes }}
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
            {logout.logoutRedirectUri && (
                <a id="continue" className="btn btn-primary" href={logout.logoutRedirectUri}>
                    {msg("doContinue")}
                </a>
            )}
        </Template>
    );
}
