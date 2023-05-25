import { useEffect, useState } from "react";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";

export default function SamlPostForm(props: PageProps<Extract<KcContext, { pageId: "saml-post-form.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { msgStr, msg } = i18n;

    const { samlPost } = kcContext;

    const [htmlFormElement, setHtmlFormElement] = useState<HTMLFormElement | null>(null);

    useEffect(() => {
        if (htmlFormElement === null) {
            return;
        }

        // Storybook
        if (samlPost.url === "") {
            alert("In a real Keycloak the user would be redirected immediately");
            return;
        }

        htmlFormElement.submit();
    }, [htmlFormElement]);
    return (
        <Template {...{ kcContext, i18n, doUseDefaultCss, classes }} displayMessage={false} headerNode={msg("saml.post-form.title")}>
            <p>{msg("saml.post-form.message")}</p>
            <form name="saml-post-binding" method="post" action={samlPost.url} ref={setHtmlFormElement}>
                {samlPost.SAMLRequest && <input type="hidden" name="SAMLRequest" value={samlPost.SAMLRequest} />}
                {samlPost.SAMLResponse && <input type="hidden" name="SAMLResponse" value={samlPost.SAMLResponse} />}
                {samlPost.relayState && <input type="hidden" name="RelayState" value={samlPost.relayState} />}
                <noscript>
                    <p>{msg("saml.post-form.js-disabled")}</p>
                    <input type="submit" value={msgStr("doContinue")} />
                </noscript>
            </form>
        </Template>
    );
}
