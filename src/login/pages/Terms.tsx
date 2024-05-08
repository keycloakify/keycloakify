import { clsx } from "keycloakify/tools/clsx";
import { Markdown } from "keycloakify/tools/Markdown";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import { useTermsMarkdown } from "keycloakify/login/lib/useDownloadTerms";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";

export default function Terms(props: PageProps<Extract<KcContext, { pageId: "terms.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    const { msg, msgStr } = i18n;

    const { url } = kcContext;

    const { termsMarkdown } = useTermsMarkdown();

    if (termsMarkdown === undefined) {
        return null;
    }

    return (
        <Template {...{ kcContext, i18n, doUseDefaultCss, classes }} displayMessage={false} headerNode={msg("termsTitle")}>
            <div id="kc-terms-text">
                <Markdown>{termsMarkdown}</Markdown>
            </div>
            <form className="form-actions" action={url.loginAction} method="POST">
                <input
                    className={clsx(
                        getClassName("kcButtonClass"),
                        getClassName("kcButtonClass"),
                        getClassName("kcButtonClass"),
                        getClassName("kcButtonPrimaryClass"),
                        getClassName("kcButtonLargeClass")
                    )}
                    name="accept"
                    id="kc-accept"
                    type="submit"
                    value={msgStr("doAccept")}
                />
                <input
                    className={clsx(getClassName("kcButtonClass"), getClassName("kcButtonDefaultClass"), getClassName("kcButtonLargeClass"))}
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
