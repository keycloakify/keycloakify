import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "../KcContext";
import { useI18n } from "../i18n";

export default function FederatedIdentity(props: PageProps<Extract<KcContext, { pageId: "federatedIdentity.ftl" }>>) {
    const { kcContext, doUseDefaultCss, classes, Template } = props;

    const { url, federatedIdentity, stateChecker } = kcContext;
    const { msg } = useI18n({ kcContext });
    return (
        <Template {...{ kcContext, doUseDefaultCss, classes }} active="federatedIdentity">
            <div className="main-layout social">
                <div className="row">
                    <div className="col-md-10">
                        <h2>{msg("federatedIdentitiesHtmlTitle")}</h2>
                    </div>
                </div>
                <div id="federated-identities">
                    {federatedIdentity.identities.map(identity => (
                        <div key={identity.providerId} className="row margin-bottom">
                            <div className="col-sm-2 col-md-2">
                                <label htmlFor={identity.providerId} className="control-label">
                                    {identity.displayName}
                                </label>
                            </div>
                            <div className="col-sm-5 col-md-5">
                                <input disabled className="form-control" value={identity.userName} />
                            </div>
                            <div className="col-sm-5 col-md-5">
                                {identity.connected ? (
                                    federatedIdentity.removeLinkPossible && (
                                        <form action={url.socialUrl} method="post" className="form-inline">
                                            <input type="hidden" name="stateChecker" value={stateChecker} />
                                            <input type="hidden" name="action" value="remove" />
                                            <input type="hidden" name="providerId" value={identity.providerId} />
                                            <button id={`remove-link-${identity.providerId}`} className="btn btn-default">
                                                {msg("doRemove")}
                                            </button>
                                        </form>
                                    )
                                ) : (
                                    <form action={url.socialUrl} method="post" className="form-inline">
                                        <input type="hidden" name="stateChecker" value={stateChecker} />
                                        <input type="hidden" name="action" value="add" />
                                        <input type="hidden" name="providerId" value={identity.providerId} />
                                        <button id={`add-link-${identity.providerId}`} className="btn btn-default">
                                            {msg("doAdd")}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Template>
    );
}
