import React, { memo } from "react";
import Template from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import { getMsg } from "../i18n";

const LoginIdpLinkEmail = memo(({ kcContext, ...props }: { kcContext: KcContextBase.LoginIdpLinkEmail } & KcProps) => {
    const { url, realm, brokerContext, idpAlias } = kcContext;

    const { msg } = getMsg(kcContext);

    return (
        <Template
            {...{ kcContext, ...props }}
            doFetchDefaultThemeResources={true}
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
});

export default LoginIdpLinkEmail;
