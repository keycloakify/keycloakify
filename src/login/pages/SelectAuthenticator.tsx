import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import { useI18n } from "../i18n";

export default function SelectAuthenticator(props: PageProps<Extract<KcContext, { pageId: "select-authenticator.ftl" }>>) {
    const { kcContext, doUseDefaultCss, Template, classes } = props;
    const { url, auth } = kcContext;

    const { kcClsx } = getKcClsx({ doUseDefaultCss, classes });
    const { msg } = useI18n({ kcContext });

    return (
        <Template
            kcContext={kcContext}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayInfo={false}
            headerNode={msg("loginChooseAuthenticator")}
        >
            <form id="kc-select-credential-form" className={kcClsx("kcFormClass")} action={url.loginAction} method="post">
                <div className={kcClsx("kcSelectAuthListClass")}>
                    {auth.authenticationSelections.map((authenticationSelection, i) => (
                        <button
                            key={i}
                            className={kcClsx("kcSelectAuthListItemClass")}
                            type="submit"
                            name="authenticationExecution"
                            value={authenticationSelection.authExecId}
                        >
                            <div className={kcClsx("kcSelectAuthListItemIconClass")}>
                                <i className={kcClsx(authenticationSelection.iconCssClass, "kcSelectAuthListItemIconPropertyClass")} />
                            </div>
                            <div className={kcClsx("kcSelectAuthListItemBodyClass")}>
                                <div className={kcClsx("kcSelectAuthListItemHeadingClass")}>{msg(authenticationSelection.displayName)}</div>
                                <div className={kcClsx("kcSelectAuthListItemDescriptionClass")}>{msg(authenticationSelection.helpText)}</div>
                            </div>
                            <div className={kcClsx("kcSelectAuthListItemFillClass")} />
                            <div className={kcClsx("kcSelectAuthListItemArrowClass")}>
                                <i className={kcClsx("kcSelectAuthListItemArrowIconClass")} />
                            </div>
                        </button>
                    ))}
                </div>
            </form>
        </Template>
    );
}
