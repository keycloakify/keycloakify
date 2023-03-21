import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";

export default function LoginIdpLinkConfirm(props: PageProps<Extract<KcContext, { pageId: "login-idp-link-confirm.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    const { url, idpAlias } = kcContext;

    const { msg } = i18n;

    return (
        <Template {...{ kcContext, i18n, doUseDefaultCss, classes }} headerNode={msg("confirmLinkIdpTitle")}>
            <form id="kc-register-form" action={url.loginAction} method="post">
                <div className={getClassName("kcFormGroupClass")}>
                    <button
                        type="submit"
                        className={clsx(
                            getClassName("kcButtonClass"),
                            getClassName("kcButtonDefaultClass"),
                            getClassName("kcButtonBlockClass"),
                            getClassName("kcButtonLargeClass")
                        )}
                        name="submitAction"
                        id="updateProfile"
                        value="updateProfile"
                    >
                        {msg("confirmLinkIdpReviewProfile")}
                    </button>
                    <button
                        type="submit"
                        className={clsx(
                            getClassName("kcButtonClass"),
                            getClassName("kcButtonDefaultClass"),
                            getClassName("kcButtonBlockClass"),
                            getClassName("kcButtonLargeClass")
                        )}
                        name="submitAction"
                        id="linkAccount"
                        value="linkAccount"
                    >
                        {msg("confirmLinkIdpContinue", idpAlias)}
                    </button>
                </div>
            </form>
        </Template>
    );
}
