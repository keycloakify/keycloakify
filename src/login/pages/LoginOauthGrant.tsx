import { clsx } from "keycloakify/tools/clsx";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import { PageProps } from "keycloakify/login/pages/PageProps";
import { KcContext } from "../KcContext";
import { useI18n } from "../i18n";

export default function LoginOauthGrant(props: PageProps<Extract<KcContext, { pageId: "login-oauth-grant.ftl" }>>) {
    const { kcContext, doUseDefaultCss, classes, Template } = props;
    const { url, oauth, client } = kcContext;

    const { msg, msgStr, advancedMsg, advancedMsgStr } = useI18n({ kcContext });

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    return (
        <Template
            {...{ kcContext, doUseDefaultCss, classes }}
            bodyClassName="oauth"
            headerNode={
                <>
                    {client.attributes.logoUri && <img src={client.attributes.logoUri} />}
                    <p>{client.name ? msg("oauthGrantTitle", advancedMsgStr(client.name)) : msg("oauthGrantTitle", client.clientId)}</p>
                </>
            }
        >
            <div id="kc-oauth" className="content-area">
                <h3>{msg("oauthGrantRequest")}</h3>
                <ul>
                    {oauth.clientScopesRequested.map(clientScope => (
                        <li key={clientScope.consentScreenText}>
                            <span>
                                {advancedMsg(clientScope.consentScreenText)}
                                {clientScope.dynamicScopeParameter && (
                                    <>
                                        : <b>{clientScope.dynamicScopeParameter}</b>
                                    </>
                                )}
                            </span>
                        </li>
                    ))}
                </ul>

                {client.attributes.policyUri ||
                    (client.attributes.tosUri && (
                        <h3>
                            {client.name ? msg("oauthGrantInformation", advancedMsgStr(client.name)) : msg("oauthGrantInformation", client.clientId)}
                            {client.attributes.tosUri && (
                                <>
                                    {msg("oauthGrantReview")}
                                    <a href={client.attributes.tosUri} target="_blank">
                                        {msg("oauthGrantTos")}
                                    </a>
                                </>
                            )}
                            {client.attributes.policyUri && (
                                <>
                                    {msg("oauthGrantReview")}
                                    <a href={client.attributes.policyUri} target="_blank">
                                        {msg("oauthGrantPolicy")}
                                    </a>
                                </>
                            )}
                        </h3>
                    ))}

                <form className="form-actions" action={url.oauthAction} method="POST">
                    <input type="hidden" name="code" value={oauth.code} />
                    <div className={getClassName("kcFormGroupClass")}>
                        <div id="kc-form-options">
                            <div className={getClassName("kcFormOptionsWrapperClass")}></div>
                        </div>

                        <div id="kc-form-buttons">
                            <div className={getClassName("kcFormButtonsWrapperClass")}>
                                <input
                                    className={clsx(
                                        getClassName("kcButtonClass"),
                                        getClassName("kcButtonPrimaryClass"),
                                        getClassName("kcButtonLargeClass")
                                    )}
                                    name="accept"
                                    id="kc-login"
                                    type="submit"
                                    value={msgStr("doYes")}
                                />
                                <input
                                    className={clsx(
                                        getClassName("kcButtonClass"),
                                        getClassName("kcButtonDefaultClass"),
                                        getClassName("kcButtonLargeClass")
                                    )}
                                    name="cancel"
                                    id="kc-cancel"
                                    type="submit"
                                    value={msgStr("doNo")}
                                />
                            </div>
                        </div>
                    </div>
                </form>
                <div className="clearfix"></div>
            </div>
        </Template>
    );
}
