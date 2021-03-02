
import { useState, useEffect, memo } from "react";
import type { ReactNode } from "react";
import { useKeycloakThemeTranslation } from "./i18n/useKeycloakTranslation";
import { keycloakPagesContext } from "./keycloakFtlValues";
import { assert } from "evt/tools/typeSafety/assert";
import { cx } from "tss-react";
import { useKeycloakLanguage, AvailableLanguages } from "./i18n/useKeycloakLanguage";
import { getLanguageLabel } from "./i18n/getLanguageLabel";
import { useCallbackFactory } from "powerhooks";
import { appendLinkInHead } from "./tools/appendLinkInHead";
import { appendScriptInHead } from "./tools/appendScriptInHead";
import { join as pathJoin } from "path";
import { useConstCallback } from "powerhooks";
import { allPropertiesValuesToUndefined } from "./tools/allPropertiesValuesToUndefined";

export type Props = {
    displayInfo?: boolean;
    displayMessage?: boolean;
    displayRequiredFields?: boolean;
    displayWide?: boolean;
    showAnotherWayIfPresent?: boolean;
    properties: KcTemplateProperties;
    headerNode: ReactNode;
    showUsernameNode: ReactNode;
    formNode: ReactNode;
    displayInfoNode: ReactNode;
};

/** Class names can be provided as an array or separated by whitespace */
export type KcClasses<T extends string> = { [key in T]?: string[] | string };

export type KcTemplateProperties = {
    stylesCommon?: string[];
    styles?: string[];
    scripts?: string[];
} & KcClasses<
    "kcLoginClass" |
    "kcHeaderClass" |
    "kcHeaderWrapperClass" |
    "kcFormCardClass" |
    "kcFormCardAccountClass" |
    "kcFormHeaderClass" |
    "kcLocaleWrapperClass" |
    "kcContentWrapperClass" |
    "kcLabelWrapperClass" |
    "kcContentWrapperClass" |
    "kcLabelWrapperClass" |
    "kcFormGroupClass" |
    "kcResetFlowIcon" |
    "kcResetFlowIcon" |
    "kcFeedbackSuccessIcon" |
    "kcFeedbackWarningIcon" |
    "kcFeedbackErrorIcon" |
    "kcFeedbackInfoIcon" |
    "kcContentWrapperClass" |
    "kcFormSocialAccountContentClass" |
    "kcFormSocialAccountClass" |
    "kcSignUpClass" |
    "kcInfoAreaWrapperClass"
>;

export const defaultKcTemplateProperties: KcTemplateProperties = {
    "styles": ["css/login.css"],
    "stylesCommon": [
        ...[".min.css", "-additions.min.css"]
            .map(end => `node_modules/patternfly/dist/css/patternfly${end}`),
        "lib/zocial/zocial.css"
    ],
    "kcLoginClass": "login-pf-page",
    "kcContentWrapperClass": "row",
    "kcHeaderClass": "login-pf-page-header",
    "kcFormCardClass": "card-pf",
    "kcFormCardAccountClass": "login-pf-accounts",
    "kcFormSocialAccountClass": "login-pf-social-section",
    "kcFormSocialAccountContentClass": "col-xs-12 col-sm-6",
    "kcFormHeaderClass": "login-pf-header",
    "kcFeedbackErrorIcon": "pficon pficon-error-circle-o",
    "kcFeedbackWarningIcon": "pficon pficon-warning-triangle-o",
    "kcFeedbackSuccessIcon": "pficon pficon-ok",
    "kcFeedbackInfoIcon": "pficon pficon-info",
    "kcResetFlowIcon": "pficon pficon-arrow fa-2x",
    "kcFormGroupClass": "form-group",
    "kcLabelWrapperClass": "col-xs-12 col-sm-12 col-md-12 col-lg-12",
    "kcSignUpClass": "login-pf-sighup"
};

/** Tu use if you don't want any default */
export const allClearKcTemplateProperties = 
    allPropertiesValuesToUndefined(defaultKcTemplateProperties);

export const Template = memo((props: Props) =>{

    const {
        displayInfo = false,
        displayMessage = true,
        displayRequiredFields = false,
        displayWide = false,
        showAnotherWayIfPresent = true,
        properties = {},
        headerNode,
        showUsernameNode,
        formNode,
        displayInfoNode
    } = props;

    const { t } = useKeycloakThemeTranslation();

    Object.assign(properties, defaultKcTemplateProperties);

    const { keycloakLanguage, setKeycloakLanguage } = useKeycloakLanguage();

    const onChangeLanguageClickFactory = useCallbackFactory(
        ([languageTag]: [AvailableLanguages]) =>
            setKeycloakLanguage(languageTag)
    );

    const onTryAnotherWayClick = useConstCallback(() => {

        document.forms["kc-select-try-another-way-form" as never].submit();

        return false;

    });

    const [{ realm, locale, auth, url, message, isAppInitiatedAction }] = useState(() => {

        assert(keycloakPagesContext !== undefined);

        return keycloakPagesContext;

    });

    useEffect(() => {

        properties.stylesCommon?.forEach(
            relativePath =>
                appendLinkInHead(
                    { "href": pathJoin(url.resourcesCommonPath, relativePath) }
                )
        );

        properties.styles?.forEach(
            relativePath =>
                appendLinkInHead(
                    { "href": pathJoin(url.resourcesPath, relativePath) }
                )
        );

        properties.scripts?.forEach(
            relativePath =>
                appendScriptInHead(
                    { "src": pathJoin(url.resourcesPath, relativePath) }
                )
        );


    }, []);

    return (
        <div className={cx(properties.kcLoginClass)}>

            <div id="kc-header" className={cx(properties.kcHeaderClass)}>
                <div id="kc-header-wrapper" className={cx(properties.kcHeaderWrapperClass)}>
                    {t("loginTitleHtml", realm.displayNameHtml)}
                </div>
            </div>

            <div className={cx("kcFormCardClass", displayWide && properties.kcFormCardAccountClass)}>
                <header className={cx(properties.kcFormHeaderClass)}>
                    {
                        (
                            realm.internationalizationEnabled &&
                            (assert(locale !== undefined), true) &&
                            locale.supported.length > 1
                        ) &&
                        <div id="kc-locale">
                            <div id="kc-locale-wrapper" className={cx(properties.kcLocaleWrapperClass)}>
                                <div className="kc-dropdown" id="kc-locale-dropdown">
                                    <a href="#" id="kc-current-locale-link">
                                        {getLanguageLabel(keycloakLanguage)}
                                    </a>
                                    <ul>
                                        {
                                            locale.supported.map(
                                                ({ languageTag }) =>
                                                    <li className="kc-dropdown-item">
                                                        <a href="#" onClick={onChangeLanguageClickFactory(languageTag)}>
                                                            {getLanguageLabel(languageTag)}
                                                        </a>

                                                    </li>
                                            )

                                        }
                                    </ul>
                                </div>
                            </div>
                        </div>

                    }
                    {
                        (
                            auth !== undefined &&
                            auth.showUsername &&
                            !auth.showResetCredentials
                        ) ?
                            (
                                displayRequiredFields ?
                                    (

                                        <div className={cx(properties.kcContentWrapperClass)}>
                                            <div className={cx(properties.kcLabelWrapperClass, "subtitle")}>
                                                <span className="subtitle">
                                                    <span className="required">*</span>
                                                    {t("requiredFields")}
                                                </span>
                                            </div>
                                            <div className="col-md-10">
                                                <h1 id="kc-page-title">{headerNode}</h1>
                                            </div>
                                        </div>

                                    )
                                    :
                                    (

                                        <h1 id="kc-page-title">{headerNode}</h1>

                                    )
                            ) : (
                                displayRequiredFields ? (
                                    <div className={cx(properties.kcContentWrapperClass)}>
                                        <div className={cx(properties.kcLabelWrapperClass, "subtitle")}>
                                            <span className="subtitle"><span className="required">*</span> {t("requiredFields")}</span>
                                        </div>
                                        <div className="col-md-10">
                                            {showUsernameNode}
                                            <div className={cx(properties.kcFormGroupClass)}>
                                                <div id="kc-username">
                                                    <label id="kc-attempted-username">{auth?.attemptedUsername}</label>
                                                    <a id="reset-login" href={url.loginRestartFlowUrl}>
                                                        <div className="kc-login-tooltip">
                                                            <i className={cx(properties.kcResetFlowIcon)}></i>
                                                            <span className="kc-tooltip-text">{t("restartLoginTooltip")}</span>
                                                        </div>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                        <>
                                            {showUsernameNode}
                                            <div className={cx(properties.kcFormGroupClass)}>
                                                <div id="kc-username">
                                                    <label id="kc-attempted-username">{auth?.attemptedUsername}</label>
                                                    <a id="reset-login" href={url.loginRestartFlowUrl}>
                                                        <div className="kc-login-tooltip">
                                                            <i className={cx(properties.kcResetFlowIcon)}></i>
                                                            <span className="kc-tooltip-text">{t("restartLoginTooltip")}</span>
                                                        </div>
                                                    </a>
                                                </div>
                                            </div>
                                        </>
                                    )
                            )
                    }
                </header>
                <div id="kc-content">
                    <div id="kc-content-wrapper">
                        {/* App-initiated actions should not see warning messages about the need to complete the action during login. */}
                        {
                            (
                                displayMessage &&
                                message !== undefined &&
                                (
                                    message.type !== "warning" ||
                                    !isAppInitiatedAction
                                )
                            ) &&
                            <div className={cx("alert", `alert-${message.type}`)}>
                                {message.type === "success" && <span className={cx(properties.kcFeedbackSuccessIcon)}></span>}
                                {message.type === "warning" && <span className={cx(properties.kcFeedbackWarningIcon)}></span>}
                                {message.type === "error" && <span className={cx(properties.kcFeedbackErrorIcon)}></span>}
                                {message.type === "info" && <span className={cx(properties.kcFeedbackInfoIcon)}></span>}
                                <span className="kc-feedback-text">{message.summary}</span>
                            </div>
                        }
                        {formNode}
                        {
                            (
                                auth !== undefined &&
                                auth.showTryAnotherWayLink &&
                                showAnotherWayIfPresent
                            ) &&

                            <form id="kc-select-try-another-way-form" action={url.loginAction} method="post" className={cx(displayWide && properties.kcContentWrapperClass)} >
                                <div className={cx(displayWide && [properties.kcFormSocialAccountContentClass, properties.kcFormSocialAccountClass])} >
                                    <div className={cx(properties.kcFormGroupClass)}>
                                        <input type="hidden" name="tryAnotherWay" value="on" />
                                        <a href="#" id="try-another-way" onClick={onTryAnotherWayClick}>{t("doTryAnotherWay")}</a>
                                    </div>
                                </div >
                            </form>
                        }
                        {
                            displayInfo &&

                            <div id="kc-info" className={cx(properties.kcSignUpClass)}>
                                <div id="kc-info-wrapper" className={cx(properties.kcInfoAreaWrapperClass)}>
                                    {displayInfoNode}
                                </div>
                            </div>
                        }
                    </div >
                </div >
            </div >
        </div >
    );
});
