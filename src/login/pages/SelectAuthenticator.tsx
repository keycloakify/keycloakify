import { clsx } from "keycloakify/tools/clsx";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import { useI18n } from "../i18n";

export default function SelectAuthenticator(props: PageProps<Extract<KcContext, { pageId: "select-authenticator.ftl" }>>) {
    const { kcContext, doUseDefaultCss, Template, classes } = props;
    const { url, auth } = kcContext;

    const { getClassName } = useGetClassName({ doUseDefaultCss, classes });
    const { msg } = useI18n({ kcContext });

    return (
        <Template {...{ kcContext, doUseDefaultCss, classes }} displayInfo={false} headerNode={msg("loginChooseAuthenticator")}>
            <form id="kc-select-credential-form" className={getClassName("kcFormClass")} action={url.loginAction} method="post">
                <div className={getClassName("kcSelectAuthListClass")}>
                    {auth.authenticationSelections.map((authenticationSelection, i) => (
                        <button
                            key={i}
                            className={getClassName("kcSelectAuthListItemClass")}
                            type="submit"
                            name="authenticationExecution"
                            value={authenticationSelection.authExecId}
                        >
                            <div className={getClassName("kcSelectAuthListItemIconClass")}>
                                <i
                                    className={clsx(
                                        getClassName(authenticationSelection.iconCssClass),
                                        getClassName("kcSelectAuthListItemIconPropertyClass")
                                    )}
                                />
                            </div>
                            <div className={getClassName("kcSelectAuthListItemBodyClass")}>
                                <div className={getClassName("kcSelectAuthListItemHeadingClass")}>{msg(authenticationSelection.displayName)}</div>
                                <div className={getClassName("kcSelectAuthListItemDescriptionClass")}>{msg(authenticationSelection.helpText)}</div>
                            </div>
                            <div className={getClassName("kcSelectAuthListItemFillClass")} />
                            <div className={getClassName("kcSelectAuthListItemArrowClass")}>
                                <i className={getClassName("kcSelectAuthListItemArrowIconClass")} />
                            </div>
                        </button>
                    ))}
                </div>
            </form>
        </Template>
    );
}
