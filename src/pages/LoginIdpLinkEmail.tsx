import React from "react";
import type { KcContextBase } from "../getKcContext";
import type { PageProps } from "../KcProps";
import type { I18nBase } from "../i18n";

export default function LoginIdpLinkEmail(props: PageProps<Extract<KcContextBase, { pageId: "login-idp-link-email.ftl" }>, I18nBase>) {
    const { kcContext, i18n, doFetchDefaultThemeResources = true, Template, ...kcProps } = props;

    const { url, realm, brokerContext, idpAlias } = kcContext;

    const { msg } = i18n;

    return (
        <Template
            {...{ kcContext, i18n, doFetchDefaultThemeResources, ...kcProps }}
            headerNode={msg("emailLinkIdpTitle", idpAlias)}
            formNode={
                <>
                    <p id="instruction1" className="instruction">
                        {msg("emailLinkIdp1", idpAlias, brokerContext.username, realm.displayName)}
                    </p>
                    <p id="instruction2" className="instruction">
                        {msg("emailLinkIdp2")} <a href={url.loginAction}>{msg("doClickHere")}</a> {msg("emailLinkIdp3")}
                    </p>
                    <p id="instruction3" className="instruction">
                        {msg("emailLinkIdp4")} <a href={url.loginAction}>{msg("doClickHere")}</a> {msg("emailLinkIdp5")}
                    </p>
                </>
            }
        />
    );
}
