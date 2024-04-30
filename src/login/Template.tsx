import { assert } from "keycloakify/tools/assert";
import { clsx } from "keycloakify/tools/clsx";
import { usePrepareTemplate } from "keycloakify/lib/usePrepareTemplate";
import { type TemplateProps } from "keycloakify/login/TemplateProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "./kcContext";
import type { I18n } from "./i18n";

export default function Template(props: TemplateProps<KcContext, I18n>) {
    const {
        displayInfo = false,
        displayMessage = true,
        displayRequiredFields = false,
        headerNode,
        showUsernameNode = null,
        socialProvidersNode = null,
        infoNode = null,
        kcContext,
        i18n,
        doUseDefaultCss,
        classes,
        children
    } = props;

    const { getClassName } = useGetClassName({ doUseDefaultCss, classes });

    const { msg, msgStr, changeLocale, labelBySupportedLanguageTag, currentLanguageTag } = i18n;

    const { realm, locale, auth, url, message, isAppInitiatedAction, authenticationSession } = kcContext;

    const { isReady } = usePrepareTemplate({
        "styles": !doUseDefaultCss
            ? []
            : [
                  `${url.resourcesCommonPath}/node_modules/@patternfly/patternfly/patternfly.min.css`,
                  `${url.resourcesCommonPath}/node_modules/patternfly/dist/css/patternfly.min.css`,
                  `${url.resourcesCommonPath}/node_modules/patternfly/dist/css/patternfly-additions.min.css`,
                  `${url.resourcesCommonPath}/lib/pficon/pficon.css`,
                  `${url.resourcesPath}/css/login.css`
              ],
        "scripts": [
            {
                "isModule": true,
                "source": {
                    "type": "url",
                    "src": `${url.resourcesPath}/js/menu-button-links.js`
                }
            },
            ...(authenticationSession === undefined
                ? []
                : [
                      {
                          "isModule": true,
                          "source": {
                              "type": "inline" as const,
                              "code": [
                                  `import { checkCookiesAndSetTimer } from "${url.resourcesPath}/js/authChecker.js";`,
                                  ``,
                                  `checkCookiesAndSetTimer(`,
                                  `  "${authenticationSession.authSessionId}",`,
                                  `  "${authenticationSession.tabId}",`,
                                  `  "${url.ssoLoginInOtherTabsUrl}"`,
                                  `);`
                              ].join("\n")
                          }
                      }
                  ])
        ],
        "htmlClassName": getClassName("kcHtmlClass"),
        "bodyClassName": getClassName("kcBodyClass"),
        "htmlLangProperty": locale?.currentLanguageTag,
        "documentTitle": msgStr("loginTitle", kcContext.realm.displayName)
    });

    if (!isReady) {
        return null;
    }

    return (
        <div className={getClassName("kcLoginClass")}>
            <div id="kc-header" className={getClassName("kcHeaderClass")}>
                <div id="kc-header-wrapper" className={getClassName("kcHeaderWrapperClass")}>
                    {msg("loginTitleHtml", realm.displayNameHtml)}
                </div>
            </div>

            <div className={getClassName("kcFormCardClass")}>
                <header className={getClassName("kcFormHeaderClass")}>
                    {realm.internationalizationEnabled && (assert(locale !== undefined), true) && locale.supported.length > 1 && (
                        <div className={getClassName("kcLocaleMainClass")} id="kc-locale">
                            <div id="kc-locale-wrapper" className={getClassName("kcLocaleWrapperClass")}>
                                <div id="kc-locale-dropdown" className={clsx("menu-button-links", getClassName("kcLocaleDropDownClass"))}>
                                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
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

                                    <button
                                        tabIndex={1}
                                        id="kc-current-locale-link"
                                        aria-label={msgStr("languages" as any)}
                                        aria-haspopup={true}
                                        aria-expanded={false}
                                        aria-controls="language-switch1"
                                    >
                                        {labelBySupportedLanguageTag[currentLanguageTag]}
                                    </button>
                                    <ul
                                        role="menu"
                                        tabIndex={-1}
                                        aria-labelledby="kc-current-locale-link"
                                        aria-activedescendant=""
                                        id="language-switch1"
                                        className={getClassName("kcLocaleListClass")}
                                    >
                                        {locale.supported.map(({ languageTag }, i) => (
                                            <li key={languageTag} className={getClassName("kcLocaleListItemClass")} role="none">
                                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                                <a
                                                    role="menuitem"
                                                    id={`language-${i}`}
                                                    className={getClassName("kcLocaleItemClass")}
                                                    href="#"
                                                    onClick={() => changeLocale(languageTag)}
                                                >
                                                    {labelBySupportedLanguageTag[languageTag]}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                    {!(auth !== undefined && auth.showUsername && !auth.showResetCredentials) ? (
                        displayRequiredFields ? (
                            <div className={getClassName("kcContentWrapperClass")}>
                                <div className={clsx(getClassName("kcLabelWrapperClass"), "subtitle")}>
                                    <span className="subtitle">
                                        <span className="required">*</span>
                                        {msg("requiredFields")}
                                    </span>
                                </div>
                                <div className="col-md-10">
                                    <h1 id="kc-page-title">{headerNode}</h1>
                                </div>
                            </div>
                        ) : (
                            <h1 id="kc-page-title">{headerNode}</h1>
                        )
                    ) : displayRequiredFields ? (
                        <div className={getClassName("kcContentWrapperClass")}>
                            <div className={clsx(getClassName("kcLabelWrapperClass"), "subtitle")}>
                                <span className="subtitle">
                                    <span className="required">*</span> {msg("requiredFields")}
                                </span>
                            </div>
                            <div className="col-md-10">
                                {showUsernameNode}
                                <div id="kc-username" className={getClassName("kcFormGroupClass")}>
                                    <label id="kc-attempted-username">{auth.attemptedUsername}</label>
                                    <a id="reset-login" href={url.loginRestartFlowUrl} aria-label={msgStr("restartLoginTooltip")}>
                                        <div className="kc-login-tooltip">
                                            <i className={getClassName("kcResetFlowIcon")}></i>
                                            <span className="kc-tooltip-text">{msg("restartLoginTooltip")}</span>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {showUsernameNode}
                            <div id="kc-username" className={getClassName("kcFormGroupClass")}>
                                <label id="kc-attempted-username">{auth.attemptedUsername}</label>
                                <a id="reset-login" href={url.loginRestartFlowUrl} aria-label={msgStr("restartLoginTooltip")}>
                                    <div className="kc-login-tooltip">
                                        <i className={getClassName("kcResetFlowIcon")}></i>
                                        <span className="kc-tooltip-text">{msg("restartLoginTooltip")}</span>
                                    </div>
                                </a>
                            </div>
                        </>
                    )}
                </header>
                <div id="kc-content">
                    <div id="kc-content-wrapper">
                        {/* App-initiated actions should not see warning messages about the need to complete the action during login. */}
                        {displayMessage && message !== undefined && (message.type !== "warning" || !isAppInitiatedAction) && (
                            <div
                                className={clsx(
                                    `alert-${message.type}`,
                                    getClassName("kcAlertClass"),
                                    `pf-m-${message?.type === "error" ? "danger" : message.type}`
                                )}
                            >
                                <div className="pf-c-alert__icon">
                                    {message.type === "success" && <span className={getClassName("kcFeedbackSuccessIcon")}></span>}
                                    {message.type === "warning" && <span className={getClassName("kcFeedbackWarningIcon")}></span>}
                                    {message.type === "error" && <span className={getClassName("kcFeedbackErrorIcon")}></span>}
                                    {message.type === "info" && <span className={getClassName("kcFeedbackInfoIcon")}></span>}
                                </div>
                                <span
                                    className={getClassName("kcAlertTitleClass")}
                                    dangerouslySetInnerHTML={{
                                        "__html": message.summary
                                    }}
                                />
                            </div>
                        )}
                        {children}
                        {auth !== undefined && auth.showTryAnotherWayLink && (
                            <form id="kc-select-try-another-way-form" action={url.loginAction} method="post">
                                <div className={getClassName("kcFormGroupClass")}>
                                    <div className={getClassName("kcFormGroupClass")}>
                                        <input type="hidden" name="tryAnotherWay" value="on" />
                                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                        <a
                                            href="#"
                                            id="try-another-way"
                                            onClick={() => {
                                                document.forms["kc-select-try-another-way-form" as never].submit();
                                                return false;
                                            }}
                                        >
                                            {msg("doTryAnotherWay")}
                                        </a>
                                    </div>
                                </div>
                            </form>
                        )}
                        {socialProvidersNode}
                        {displayInfo && (
                            <div id="kc-info" className={getClassName("kcSignUpClass")}>
                                <div id="kc-info-wrapper" className={getClassName("kcInfoAreaWrapperClass")}>
                                    {infoNode}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
