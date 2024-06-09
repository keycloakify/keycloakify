import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import { useI18n } from "../i18n";

export default function LoginPageExpired(props: PageProps<Extract<KcContext, { pageId: "login-page-expired.ftl" }>>) {
    const { kcContext, doUseDefaultCss, Template, classes } = props;

    const { url } = kcContext;

    const { msg } = useI18n({ kcContext });

    return (
        <Template kcContext={kcContext} doUseDefaultCss={doUseDefaultCss} classes={classes} headerNode={msg("pageExpiredTitle")}>
            <p id="instruction1" className="instruction">
                {msg("pageExpiredMsg1")}
                <a id="loginRestartLink" href={url.loginRestartFlowUrl}>
                    {msg("doClickHere")}
                </a>{" "}
                .<br />
                {msg("pageExpiredMsg2")}{" "}
                <a id="loginContinueLink" href={url.loginAction}>
                    {msg("doClickHere")}
                </a>{" "}
                .
            </p>
        </Template>
    );
}
