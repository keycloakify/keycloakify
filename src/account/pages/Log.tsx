import type { Key } from "react";
import { getKcClsx } from "keycloakify/account/lib/kcClsx";
import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "../KcContext";
import { useI18n } from "../i18n";

export default function Log(props: PageProps<Extract<KcContext, { pageId: "log.ftl" }>>) {
    const { kcContext, doUseDefaultCss, classes, Template } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { log } = kcContext;

    const { msg } = useI18n({ kcContext });

    return (
        <Template {...{ kcContext, doUseDefaultCss, classes }} active="log">
            <div className={kcClsx("kcContentWrapperClass")}>
                <div className="col-md-10">
                    <h2>{msg("accountLogHtmlTitle")}</h2>
                </div>

                <table className="table table-striped table-bordered">
                    <thead>
                        <tr>
                            <td>{msg("date")}</td>
                            <td>{msg("event")}</td>
                            <td>{msg("ip")}</td>
                            <td>{msg("client")}</td>
                            <td>{msg("details")}</td>
                        </tr>
                    </thead>

                    <tbody>
                        {log.events.map(
                            (
                                event: {
                                    date: string | number | Date;
                                    event: string;
                                    ipAddress: string;
                                    client: any;
                                    details: any[];
                                },
                                index: Key | null | undefined
                            ) => (
                                <tr key={index}>
                                    <td>{event.date ? new Date(event.date).toLocaleString() : ""}</td>
                                    <td>{event.event}</td>
                                    <td>{event.ipAddress}</td>
                                    <td>{event.client || ""}</td>
                                    <td>
                                        {event.details.map((detail, detailIndex) => (
                                            <span key={detailIndex}>
                                                {`${detail.key} = ${detail.value}`}
                                                {detailIndex < event.details.length - 1 && ", "}
                                            </span>
                                        ))}
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </Template>
    );
}
