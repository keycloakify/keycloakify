import { clsx } from "keycloakify/tools/clsx";
import { usePrepareTemplate } from "keycloakify/lib/usePrepareTemplate";
import { type TemplateProps } from "keycloakify/account/TemplateProps";
import type { KcContext } from "./kcContext";
import type { I18n } from "./i18n";
import { assert } from "keycloakify/tools/assert";

export default function Template(props: TemplateProps<KcContext, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, bodyClass, active, children } = props;

    const { msg, changeLocale, labelBySupportedLanguageTag, currentLanguageTag } = i18n;

    const { locale, url, features, realm, message, referrer } = kcContext;

    const { isReady } = usePrepareTemplate({
        "doFetchDefaultThemeResources": doUseDefaultCss,
        url,
        "stylesCommon": ["node_modules/patternfly/dist/css/patternfly.min.css", "node_modules/patternfly/dist/css/patternfly-additions.min.css"],
        "styles": ["css/account.css"],
        "htmlClassName": undefined,
        "bodyClassName": clsx("admin-console", "user", bodyClass)
    });

    if (!isReady) {
        return null;
    }

    return (
        <>
            <header className="navbar navbar-default navbar-pf navbar-main header">
                <nav className="navbar" role="navigation">
                    <div className="navbar-header">
                        <div className="container">
                            <h1 className="navbar-title">Keycloak</h1>
                        </div>
                    </div>
                    <div className="navbar-collapse navbar-collapse-1">
                        <div className="container">
                            <ul className="nav navbar-nav navbar-utility">
                                {realm.internationalizationEnabled && (assert(locale !== undefined), true) && locale.supported.length > 1 && (
                                    <li>
                                        <div className="kc-dropdown" id="kc-locale-dropdown">
                                            <a href="#" id="kc-current-locale-link">
                                                {labelBySupportedLanguageTag[currentLanguageTag]}
                                            </a>
                                            <ul>
                                                {locale.supported.map(({ languageTag }) => (
                                                    <li key={languageTag} className="kc-dropdown-item">
                                                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                                        <a href="#" onClick={() => changeLocale(languageTag)}>
                                                            {labelBySupportedLanguageTag[languageTag]}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </li>
                                )}
                                {referrer?.url !== undefined && (
                                    <li>
                                        <a href={referrer.url} id="referrer">
                                            {msg("backTo", referrer.name)}
                                        </a>
                                    </li>
                                )}
                                <li>
                                    <a href={url.getLogoutUrl()}>{msg("doSignOut")}</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </header>

            <div className="container">
                <div className="bs-sidebar col-sm-3">
                    <ul>
                        <li className={clsx(active === "account" && "active")}>
                            <a href={url.accountUrl}>{msg("account")}</a>
                        </li>
                        {features.passwordUpdateSupported && (
                            <li className={clsx(active === "password" && "active")}>
                                <a href={url.passwordUrl}>{msg("password")}</a>
                            </li>
                        )}
                        <li className={clsx(active === "totp" && "active")}>
                            <a href={url.totpUrl}>{msg("authenticator")}</a>
                        </li>
                        {features.identityFederation && (
                            <li className={clsx(active === "social" && "active")}>
                                <a href={url.socialUrl}>{msg("federatedIdentity")}</a>
                            </li>
                        )}
                        <li className={clsx(active === "sessions" && "active")}>
                            <a href={url.sessionsUrl}>{msg("sessions")}</a>
                        </li>
                        <li className={clsx(active === "applications" && "active")}>
                            <a href={url.applicationsUrl}>{msg("applications")}</a>
                        </li>
                        {features.log && (
                            <li className={clsx(active === "log" && "active")}>
                                <a href={url.logUrl}>{msg("log")}</a>
                            </li>
                        )}
                        {realm.userManagedAccessAllowed && features.authorization && (
                            <li className={clsx(active === "authorization" && "active")}>
                                <a href={url.resourceUrl}>{msg("myResources")}</a>
                            </li>
                        )}
                    </ul>
                </div>

                <div className="col-sm-9 content-area">
                    {message !== undefined && (
                        <div className={clsx("alert", `alert-${message.type}`)}>
                            {message.type === "success" && <span className="pficon pficon-ok"></span>}
                            {message.type === "error" && <span className="pficon pficon-error-circle-o"></span>}
                            <span className="kc-feedback-text">{message.summary}</span>
                        </div>
                    )}

                    {children}
                </div>
            </div>
        </>
    );
}
