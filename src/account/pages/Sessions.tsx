import { getKcClsx } from "keycloakify/account/lib/kcClsx";
import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "../KcContext";
import { useI18n } from "../i18n";

export default function Sessions(props: PageProps<Extract<KcContext, { pageId: "sessions.ftl" }>>) {
    const { kcContext, doUseDefaultCss, Template, classes } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { url, stateChecker, sessions } = kcContext;

    const { msg } = useI18n({ kcContext });
    return (
        <Template {...{ kcContext, doUseDefaultCss, classes }} active="sessions">
            <div className={kcClsx("kcContentWrapperClass")}>
                <div className="col-md-10">
                    <h2>{msg("sessionsHtmlTitle")}</h2>
                </div>
            </div>

            <table className="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th>{msg("ip")}</th>
                        <th>{msg("started")}</th>
                        <th>{msg("lastAccess")}</th>
                        <th>{msg("expires")}</th>
                        <th>{msg("clients")}</th>
                    </tr>
                </thead>

                <tbody role="rowgroup">
                    {sessions.sessions.map((session, index: number) => (
                        <tr key={index}>
                            <td>{session.ipAddress}</td>
                            <td>{session?.started}</td>
                            <td>{session?.lastAccess}</td>
                            <td>{session?.expires}</td>
                            <td>
                                {session.clients.map((client: string, clientIndex: number) => (
                                    <div key={clientIndex}>
                                        {client}
                                        <br />
                                    </div>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <form action={url.sessionsUrl} method="post">
                <input type="hidden" id="stateChecker" name="stateChecker" value={stateChecker} />
                <button id="logout-all-sessions" type="submit" className={kcClsx("kcButtonDefaultClass", "kcButtonClass")}>
                    {msg("doLogOutAllSessions")}
                </button>
            </form>
        </Template>
    );
}
