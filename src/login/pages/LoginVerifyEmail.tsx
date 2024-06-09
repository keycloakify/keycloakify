import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import { useI18n } from "../i18n";

export default function LoginVerifyEmail(props: PageProps<Extract<KcContext, { pageId: "login-verify-email.ftl" }>>) {
    const { kcContext, doUseDefaultCss, Template, classes } = props;

    const { msg } = useI18n({ kcContext });

    const { url, user } = kcContext;

    return (
        <Template
            {...{ kcContext, doUseDefaultCss, classes }}
            displayInfo
            headerNode={msg("emailVerifyTitle")}
            infoNode={
                <p className="instruction">
                    {msg("emailVerifyInstruction2")}
                    <br />
                    <a href={url.loginAction}>{msg("doClickHere")}</a>
                    &nbsp;
                    {msg("emailVerifyInstruction3")}
                </p>
            }
        >
            <p className="instruction">{msg("emailVerifyInstruction1", user?.email ?? "")}</p>
        </Template>
    );
}
