import { clsx } from "keycloakify/tools/clsx";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function SelectAuthenticator(props: PageProps<Extract<KcContext, { pageId: "select-authenticator.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
    const { url, auth } = kcContext;

    const { getClassName } = useGetClassName({ doUseDefaultCss, classes });
    const { msg } = i18n;

    return (
        <Template {...{ kcContext, i18n, doUseDefaultCss, classes }} displayInfo={false} headerNode={msg("loginChooseAuthenticator")}>
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
                                        // @ts-expect-error: iconCssClass is a string and not a class key
                                        // however getClassName gracefully handles this case at runtime
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
