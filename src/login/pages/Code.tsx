import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import { useI18n } from "../i18n";

export default function Code(props: PageProps<Extract<KcContext, { pageId: "code.ftl" }>>) {
    const { kcContext, doUseDefaultCss, Template, classes } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { code } = kcContext;

    const { msg } = useI18n({ kcContext });

    return (
        <Template
            kcContext={kcContext}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            headerNode={code.success ? msg("codeSuccessTitle") : msg("codeErrorTitle", code.error)}
        >
            <div id="kc-code">
                {code.success ? (
                    <>
                        <p>{msg("copyCodeInstruction")}</p>
                        <input id="code" className={kcClsx("kcTextareaClass")} defaultValue={code.code} />
                    </>
                ) : (
                    <p id="error">{code.error}</p>
                )}
            </div>
        </Template>
    );
}
