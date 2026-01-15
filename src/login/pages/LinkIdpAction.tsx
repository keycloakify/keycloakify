import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function LinkIdpAction(props: PageProps<Extract<KcContext, { pageId: "link-idp-action.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { idpDisplayName, url } = kcContext;

    const { msg, msgStr } = i18n;

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            headerNode={msg("linkIdpActionTitle", idpDisplayName)}
            displayMessage={false}
        >
            <div id="kc-link-text" className={kcClsx("kcContentWrapperClass")}>
                {msg("linkIdpActionMessage", idpDisplayName)}
            </div>
            <form className={kcClsx("kcFormClass")} action={url.loginAction} method="post">
                <div className={kcClsx("kcFormGroupClass")}>
                    <div id="kc-form-buttons" className={kcClsx("kcFormButtonsClass")}>
                        <input
                            className={kcClsx("kcButtonClass", "kcButtonPrimaryClass", "kcButtonLargeClass")}
                            name="continue"
                            id="kc-continue"
                            type="submit"
                            value={msgStr("doContinue")}
                        />
                        <input
                            className={kcClsx("kcButtonClass", "kcButtonDefaultClass", "kcButtonLargeClass")}
                            name="cancel-aia"
                            id="kc-cancel"
                            type="submit"
                            value={msgStr("doCancel")}
                        />
                    </div>
                </div>
            </form>
            <div className="clearfix" />
        </Template>
    );
}
