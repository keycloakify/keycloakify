import { Markdown } from "keycloakify/tools/Markdown";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import { useTermsMarkdown } from "keycloakify/login/lib/useDownloadTerms";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import { useI18n } from "../i18n";

export default function Terms(props: PageProps<Extract<KcContext, { pageId: "terms.ftl" }>>) {
    const { kcContext, doUseDefaultCss, Template, classes } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { msg, msgStr } = useI18n({ kcContext });

    const { locale, url } = kcContext;

    const { isDownloadComplete, termsMarkdown, termsLanguageTag } = useTermsMarkdown();

    if (!isDownloadComplete) {
        return null;
    }

    return (
        <Template kcContext={kcContext} doUseDefaultCss={doUseDefaultCss} classes={classes} displayMessage={false} headerNode={msg("termsTitle")}>
            <div id="kc-terms-text" lang={termsLanguageTag !== locale?.currentLanguageTag ? termsLanguageTag : undefined}>
                <Markdown>{termsMarkdown}</Markdown>
            </div>
            <form className="form-actions" action={url.loginAction} method="POST">
                <input
                    className={kcClsx("kcButtonClass", "kcButtonClass", "kcButtonClass", "kcButtonPrimaryClass", "kcButtonLargeClass")}
                    name="accept"
                    id="kc-accept"
                    type="submit"
                    value={msgStr("doAccept")}
                />
                <input
                    className={kcClsx("kcButtonClass", "kcButtonDefaultClass", "kcButtonLargeClass")}
                    name="cancel"
                    id="kc-decline"
                    type="submit"
                    value={msgStr("doDecline")}
                />
            </form>
            <div className="clearfix" />
        </Template>
    );
}
