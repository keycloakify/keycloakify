import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function LoginX509Info(props: PageProps<Extract<KcContext, { pageId: "login-x509-info.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { url, x509 } = kcContext;

    const { msg, msgStr } = i18n;

    return (
        <Template kcContext={kcContext} i18n={i18n} doUseDefaultCss={doUseDefaultCss} classes={classes} headerNode={msg("doLogIn")}>
            <form id="kc-x509-login-info" className={kcClsx("kcFormClass")} action={url.loginAction} method="post">
                <div className={kcClsx("kcFormGroupClass")}>
                    <div className={kcClsx("kcLabelWrapperClass")}>
                        <label htmlFor="certificate_subjectDN" className={kcClsx("kcLabelClass")}>
                            {msg("clientCertificate")}
                        </label>
                    </div>
                    {x509.formData.subjectDN ? (
                        <div className={kcClsx("kcLabelWrapperClass")}>
                            <label id="certificate_subjectDN" className={kcClsx("kcLabelClass")}>
                                {x509.formData.subjectDN}
                            </label>
                        </div>
                    ) : (
                        <div className={kcClsx("kcLabelWrapperClass")}>
                            <label id="certificate_subjectDN" className={kcClsx("kcLabelClass")}>
                                {msg("noCertificate")}
                            </label>
                        </div>
                    )}
                </div>
                <div className={kcClsx("kcFormGroupClass")}>
                    {x509.formData.isUserEnabled && (
                        <>
                            <div className={kcClsx("kcLabelWrapperClass")}>
                                <label htmlFor="username" className={kcClsx("kcLabelClass")}>
                                    {msg("doX509Login")}
                                </label>
                            </div>
                            <div className={kcClsx("kcLabelWrapperClass")}>
                                <label id="username" className={kcClsx("kcLabelClass")}>
                                    {x509.formData.username}
                                </label>
                            </div>
                        </>
                    )}
                </div>
                <div className={kcClsx("kcFormGroupClass")}>
                    <div id="kc-form-options" className={kcClsx("kcFormOptionsClass")}>
                        <div className={kcClsx("kcFormOptionsWrapperClass")} />
                    </div>
                    <div id="kc-form-buttons" className={kcClsx("kcFormButtonsClass")}>
                        <div className={kcClsx("kcFormButtonsWrapperClass")}>
                            <input
                                className={kcClsx("kcButtonClass", "kcButtonPrimaryClass", "kcButtonLargeClass")}
                                name="login"
                                id="kc-login"
                                type="submit"
                                value={msgStr("doContinue")}
                            />
                            {x509.formData.isUserEnabled && (
                                <input
                                    className={kcClsx("kcButtonClass", "kcButtonDefaultClass", "kcButtonLargeClass")}
                                    name="cancel"
                                    id="kc-cancel"
                                    type="submit"
                                    value={msgStr("doIgnore")}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </Template>
    );
}
