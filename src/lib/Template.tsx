
import type { ReactNode } from "react";
import { useState, useEffect } from "react";
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

type KcClasses<T extends string> = { [key in T]?: string[] | string };

export type KcProperties = {
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

export type Props = {
    displayInfo?: boolean;
    displayMessage: boolean;
    displayRequiredFields: boolean;
    displayWide: boolean;
    showAnotherWayIfPresent: boolean;
    properties?: KcProperties;
    headerNode: ReactNode;
    showUsernameNode: ReactNode;
    formNode: ReactNode;
    displayInfoNode: ReactNode;
};

export function Template(props: Props) {

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
}
