
import { useState, useReducer ,useEffect, memo } from "react";
import type { ReactNode } from "react";
import { useKcTranslation } from "../i18n/useKcTranslation";
import { kcContext } from "../kcContext";
import { assert } from "../tools/assert";
import { cx } from "tss-react";
import { useKcLanguageTag } from "../i18n/useKcLanguageTag";
import type { KcLanguageTag } from "../i18n/KcLanguageTag";
import { getKcLanguageTagLabel } from "../i18n/KcLanguageTag";
import { useCallbackFactory } from "powerhooks";
import { appendHead } from "../tools/appendHead";
import { join as pathJoin } from "path";
import { useConstCallback } from "powerhooks";
import type { KcTemplateProps } from "./KcProps";

export type TemplateProps = {
    displayInfo?: boolean;
    displayMessage?: boolean;
    displayRequiredFields?: boolean;
    displayWide?: boolean;
    showAnotherWayIfPresent?: boolean;
    headerNode: ReactNode;
    showUsernameNode?: ReactNode;
    formNode: ReactNode;
    displayInfoNode?: ReactNode;
} & KcTemplateProps;


export const Template = memo((props: TemplateProps) => {

    const {
        displayInfo = false,
        displayMessage = true,
        displayRequiredFields = false,
        displayWide = false,
        showAnotherWayIfPresent = true,
        headerNode,
        showUsernameNode = null,
        formNode,
        displayInfoNode = null
    } = props;

    useEffect(()=> { console.log("Rendering this page with react using keycloakify") },[]);

    const { t } = useKcTranslation();

    const { kcLanguageTag, setKcLanguageTag } = useKcLanguageTag();

    const onChangeLanguageClickFactory = useCallbackFactory(
        ([languageTag]: [KcLanguageTag]) => 
            setKcLanguageTag(languageTag)
    );

    const onTryAnotherWayClick = useConstCallback(() => {

        document.forms["kc-select-try-another-way-form" as never].submit();

        return false;

    });

    const [{ realm, locale, auth, url, message, isAppInitiatedAction }] = useState(() => (
        assert(kcContext !== undefined, "App is not currently being served by KeyCloak"),
        kcContext
    ));

    const [isExtraCssLoaded, setExtraCssLoaded] = useReducer(() => true, false);

    useEffect(() => {

        let isUnmounted = false;

        const toArr= (x: string | readonly string[] | undefined )=> typeof x === "string" ? x.split(" ") : x ?? [];

        Promise.all(
            [
                ...toArr(props.stylesCommon).map(relativePath => pathJoin(url.resourcesCommonPath, relativePath)),
                ...toArr(props.styles).map(relativePath => pathJoin(url.resourcesPath, relativePath))
            ].map(href => appendHead({
                "type": "css",
                href
            }))).then(() => {

                if (isUnmounted) {
                    return;
                }

                setExtraCssLoaded();

            });

        toArr(props.scripts).forEach(
            relativePath => appendHead({
                "type": "javascript",
                "src": pathJoin(url.resourcesPath, relativePath)
            })
        );

        document.getElementsByTagName("html")[0]
            .classList
            .add(cx(props.kcHtmlClass));

        return () => { isUnmounted = true; };

    }, []);

    if (!isExtraCssLoaded) {
        return null;
    }

    return (
        <div className={cx(props.kcLoginClass)}>

            <div id="kc-header" className={cx(props.kcHeaderClass)}>
                <div id="kc-header-wrapper" className={cx(props.kcHeaderWrapperClass)}>
                    {t("loginTitleHtml", realm.displayNameHtml)}
                </div>
            </div>

            <div className={cx(props.kcFormCardClass, displayWide && props.kcFormCardAccountClass)}>
                <header className={cx(props.kcFormHeaderClass)}>
                    {
                        (
                            realm.internationalizationEnabled &&
                            (assert(locale !== undefined), true) &&
                            locale.supported.length > 1
                        ) &&
                        <div id="kc-locale">
                            <div id="kc-locale-wrapper" className={cx(props.kcLocaleWrapperClass)}>
                                <div className="kc-dropdown" id="kc-locale-dropdown">
                                    <a href="#" id="kc-current-locale-link">
                                        {getKcLanguageTagLabel(kcLanguageTag)}
                                    </a>
                                    <ul>
                                        {
                                            locale.supported.map(
                                                ({ languageTag, url }) =>
                                                    <li className="kc-dropdown-item">
                                                        <a href={url} onClick={onChangeLanguageClickFactory(languageTag)}>
                                                            {getKcLanguageTagLabel(languageTag)}
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
                        !(
                            auth !== undefined &&
                            auth.showUsername &&
                            !auth.showResetCredentials
                        ) ?
                            (
                                displayRequiredFields ?
                                    (

                                        <div className={cx(props.kcContentWrapperClass)}>
                                            <div className={cx(props.kcLabelWrapperClass, "subtitle")}>
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
                                    <div className={cx(props.kcContentWrapperClass)}>
                                        <div className={cx(props.kcLabelWrapperClass, "subtitle")}>
                                            <span className="subtitle"><span className="required">*</span> {t("requiredFields")}</span>
                                        </div>
                                        <div className="col-md-10">
                                            {showUsernameNode}
                                            <div className={cx(props.kcFormGroupClass)}>
                                                <div id="kc-username">
                                                    <label id="kc-attempted-username">{auth?.attemptedUsername}</label>
                                                    <a id="reset-login" href={url.loginRestartFlowUrl}>
                                                        <div className="kc-login-tooltip">
                                                            <i className={cx(props.kcResetFlowIcon)}></i>
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
                                            <div className={cx(props.kcFormGroupClass)}>
                                                <div id="kc-username">
                                                    <label id="kc-attempted-username">{auth?.attemptedUsername}</label>
                                                    <a id="reset-login" href={url.loginRestartFlowUrl}>
                                                        <div className="kc-login-tooltip">
                                                            <i className={cx(props.kcResetFlowIcon)}></i>
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
                                {message.type === "success" && <span className={cx(props.kcFeedbackSuccessIcon)}></span>}
                                {message.type === "warning" && <span className={cx(props.kcFeedbackWarningIcon)}></span>}
                                {message.type === "error" && <span className={cx(props.kcFeedbackErrorIcon)}></span>}
                                {message.type === "info" && <span className={cx(props.kcFeedbackInfoIcon)}></span>}
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

                            <form id="kc-select-try-another-way-form" action={url.loginAction} method="post" className={cx(displayWide && props.kcContentWrapperClass)} >
                                <div className={cx(displayWide && [props.kcFormSocialAccountContentClass, props.kcFormSocialAccountClass])} >
                                    <div className={cx(props.kcFormGroupClass)}>
                                        <input type="hidden" name="tryAnotherWay" value="on" />
                                        <a href="#" id="try-another-way" onClick={onTryAnotherWayClick}>{t("doTryAnotherWay")}</a>
                                    </div>
                                </div >
                            </form>
                        }
                        {
                            displayInfo &&

                            <div id="kc-info" className={cx(props.kcSignUpClass)}>
                                <div id="kc-info-wrapper" className={cx(props.kcInfoAreaWrapperClass)}>
                                    {displayInfoNode}
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
});
