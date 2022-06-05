import { memo } from "react";
import { Template } from "./Template";
import type { KcProps } from "./KcProps";
import type { KcContextBase } from "../getKcContext/KcContextBase";
import type { I18n } from "../i18n";

export const LoginIdpLinkEmail = memo(
    ({ kcContext, useI18n, ...props }: { kcContext: KcContextBase.LoginIdpLinkEmail; useI18n: () => I18n } & KcProps) => {
        const { url, realm, brokerContext, idpAlias } = kcContext;

        const { msg } = useI18n();

        return (
            <Template
                {...{ kcContext, useI18n, ...props }}
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
    },
);
