import { clsx } from "keycloakify/tools/clsx";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import { useI18n } from "../i18n";

export default function LoginIdpLinkConfirm(props: PageProps<Extract<KcContext, { pageId: "login-idp-link-confirm.ftl" }>>) {
    const { kcContext, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    const { url, idpAlias } = kcContext;

    const { msg } = useI18n({ kcContext });

    return (
        <Template {...{ kcContext, doUseDefaultCss, classes }} headerNode={msg("confirmLinkIdpTitle")}>
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
