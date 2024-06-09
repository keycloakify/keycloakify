import { clsx } from "keycloakify/tools/clsx";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import { useI18n } from "../i18n";

export default function DeleteCredential(props: PageProps<Extract<KcContext, { pageId: "delete-credential.ftl" }>>) {
    const { kcContext, doUseDefaultCss, Template, classes } = props;

    const { msgStr, msg } = useI18n({ kcContext });

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    const { url, credentialLabel } = kcContext;

    return (
        <Template {...{ kcContext, doUseDefaultCss, classes }} displayMessage={false} headerNode={msg("deleteCredentialTitle", credentialLabel)}>
            <div id="kc-delete-text">{msg("deleteCredentialMessage", credentialLabel)}</div>
            <form className="form-actions" action={url.loginAction} method="POST">
                <input
                    className={clsx(getClassName("kcButtonClass"), getClassName("kcButtonPrimaryClass"), getClassName("kcButtonLargeClass"))}
                    name="accept"
                    id="kc-accept"
                    type="submit"
                    value={msgStr("doConfirmDelete")}
                />
                <input
                    className={clsx(getClassName("kcButtonClass"), getClassName("kcButtonDefaultClass"), getClassName("kcButtonLargeClass"))}
                    name="cancel-aia"
                    value={msgStr("doCancel")}
                    id="kc-decline"
                    type="submit"
                />
            </form>
            <div className="clearfix" />
        </Template>
    );
}
