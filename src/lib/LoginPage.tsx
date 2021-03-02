
import { useState, memo } from "react";
import { allPropertiesValuesToUndefined } from "./tools/allPropertiesValuesToUndefined";
import { Template, defaultKcTemplateProperties } from "./Template";
import type { KcTemplateProperties, KcClasses } from "./Template";
import { assert } from "evt/tools/typeSafety/assert";
import { keycloakPagesContext } from "./keycloakFtlValues";
import { useKeycloakThemeTranslation } from "./i18n/useKeycloakTranslation";
import { cx } from "tss-react";
import { useConstCallback } from "powerhooks";

export type KcLoginPageProperties = KcTemplateProperties & KcClasses<
    "kcLogoLink" |
    "kcLogoClass" |
    "kcContainerClass" |
    "kcContentClass" |
    "kcFeedbackAreaClass" |
    "kcLocaleClass" |
    "kcAlertIconClasserror" |
    "kcFormAreaClass" |
    "kcFormSocialAccountListClass" |
    "kcFormSocialAccountDoubleListClass" |
    "kcFormSocialAccountListLinkClass" |
    "kcWebAuthnKeyIcon" |
    "kcFormClass" |
    "kcFormGroupErrorClass" |
    "kcLabelClass" |
    "kcInputClass" |
    "kcInputWrapperClass" |
    "kcFormOptionsClass" |
    "kcFormButtonsClass" |
    "kcFormSettingClass" |
    "kcTextareaClass" |
    "kcInfoAreaClass" |
    "kcButtonClass" |
    "kcButtonPrimaryClass" |
    "kcButtonDefaultClass" |
    "kcButtonLargeClass" |
    "kcButtonBlockClass" |
    "kcInputLargeClass" |
    "kcSrOnlyClass" |
    "kcSelectAuthListClass" |
    "kcSelectAuthListItemClass" |
    "kcSelectAuthListItemInfoClass" |
    "kcSelectAuthListItemLeftClass" |
    "kcSelectAuthListItemBodyClass" |
    "kcSelectAuthListItemDescriptionClass" |
    "kcSelectAuthListItemHeadingClass" |
    "kcSelectAuthListItemHelpTextClass" |
    "kcAuthenticatorDefaultClass" |
    "kcAuthenticatorPasswordClass" |
    "kcAuthenticatorOTPClass" |
    "kcAuthenticatorWebAuthnClass" |
    "kcAuthenticatorWebAuthnPasswordlessClass" |
    "kcSelectOTPListClass" |
    "kcSelectOTPListItemClass" |
    "kcAuthenticatorOtpCircleClass" |
    "kcSelectOTPItemHeadingClass" |
    "kcFormOptionsWrapperClass"
>;

export const defaultKcLoginPageProperties: KcLoginPageProperties = {
    ...defaultKcTemplateProperties,
    "kcLogoLink": "http://www.keycloak.org",
    "kcLogoClass": "login-pf-brand",
    "kcContainerClass": "container-fluid",
    "kcContentClass": "col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3 col-lg-6 col-lg-offset-3",
    "kcFeedbackAreaClass": "col-md-12",
    "kcLocaleClass": "col-xs-12 col-sm-1",
    "kcAlertIconClasserror": "pficon pficon-error-circle-o",

    "kcFormAreaClass": "col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 col-lg-8 col-lg-offset-2",
    "kcFormSocialAccountListClass": "login-pf-social list-unstyled login-pf-social-all",
    "kcFormSocialAccountDoubleListClass": "login-pf-social-double-col",
    "kcFormSocialAccountListLinkClass": "login-pf-social-link",
    "kcWebAuthnKeyIcon": "pficon pficon-key",

    "kcFormClass": "form-horizontal",
    "kcFormGroupErrorClass": "has-error",
    "kcLabelClass": "control-label",
    "kcInputClass": "form-control",
    "kcInputWrapperClass": "col-xs-12 col-sm-12 col-md-12 col-lg-12",
    "kcFormOptionsClass": "col-xs-12 col-sm-12 col-md-12 col-lg-12",
    "kcFormButtonsClass": "col-xs-12 col-sm-12 col-md-12 col-lg-12",
    "kcFormSettingClass": "login-pf-settings",
    "kcTextareaClass": "form-control",

    "kcInfoAreaClass": "col-xs-12 col-sm-4 col-md-4 col-lg-5 details",

    // css classes for form buttons main class used for all buttons
    "kcButtonClass": "btn",
    // classes defining priority of the button - primary or default (there is typically only one priority button for the form)
    "kcButtonPrimaryClass": "btn-primary",
    "kcButtonDefaultClass": "btn-default",
    // classes defining size of the button
    "kcButtonLargeClass": "btn-lg",
    "kcButtonBlockClass": "btn-block",

    // css classes for input
    "kcInputLargeClass": "input-lg",

    // css classes for form accessability
    "kcSrOnlyClass": "sr-only",

    // css classes for select-authenticator form
    "kcSelectAuthListClass": "list-group list-view-pf",
    "kcSelectAuthListItemClass": "list-group-item list-view-pf-stacked",
    "kcSelectAuthListItemInfoClass": "list-view-pf-main-info",
    "kcSelectAuthListItemLeftClass": "list-view-pf-left",
    "kcSelectAuthListItemBodyClass": "list-view-pf-body",
    "kcSelectAuthListItemDescriptionClass": "list-view-pf-description",
    "kcSelectAuthListItemHeadingClass": "list-group-item-heading",
    "kcSelectAuthListItemHelpTextClass": "list-group-item-text",

    // css classes for the authenticators
    "kcAuthenticatorDefaultClass": "fa list-view-pf-icon-lg",
    "kcAuthenticatorPasswordClass": "fa fa-unlock list-view-pf-icon-lg",
    "kcAuthenticatorOTPClass": "fa fa-mobile list-view-pf-icon-lg",
    "kcAuthenticatorWebAuthnClass": "fa fa-key list-view-pf-icon-lg",
    "kcAuthenticatorWebAuthnPasswordlessClass": "fa fa-key list-view-pf-icon-lg",

    //css classes for the OTP Login Form
    "kcSelectOTPListClass": "card-pf card-pf-view card-pf-view-select card-pf-view-single-select",
    "kcSelectOTPListItemClass": "card-pf-body card-pf-top-element",
    "kcAuthenticatorOtpCircleClass": "fa fa-mobile card-pf-icon-circle",
    "kcSelectOTPItemHeadingClass": "card-pf-title text-center"
};



/** Tu use if you don't want any default */
export const allClearKcLoginPageProperties =
    allPropertiesValuesToUndefined(defaultKcLoginPageProperties);

export type Props = {
    properties?: KcLoginPageProperties;
};

export const LoginPage = memo((props: Props) => {

    const { properties = {} } = props;

    const { t, tStr } = useKeycloakThemeTranslation();

    Object.assign(properties, defaultKcLoginPageProperties);

    const [{
        social, realm, url,
        usernameEditDisabled, login,
        auth, registrationDisabled
    }] = useState(() => {

        assert(keycloakPagesContext !== undefined);

        return keycloakPagesContext;

    });

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    const onSubmit = useConstCallback(() =>
        (setIsLoginButtonDisabled(true), true)
    );


    return (
        <Template
            displayInfo={social.displayInfo}
            displayWide={realm.password && social.providers !== undefined}
            properties={properties}
            headerNode={t("doLogIn")}
            showUsernameNode={null}
            formNode={


                <div
                    id="kc-form"
                    className={cx(realm.password && social.providers !== undefined && properties.kcContentWrapperClass)}
                >
                    <div
                        id="kc-form-wrapper"
                        className={cx(realm.password && social.providers && [properties.kcFormSocialAccountContentClass, properties.kcFormSocialAccountClass])}
                    >
                        {
                            realm.password &&
                            (
                                <form id="kc-form-login" onSubmit={onSubmit} action={url.loginAction} method="post">
                                    <div className={cx(properties.kcFormGroupClass)}>
                                        <label htmlFor="username" className={cx(properties.kcLabelClass)}>
                                            {
                                                !realm.loginWithEmailAllowed ?
                                                    t("username")
                                                    :
                                                    (
                                                        !realm.registrationEmailAsUsername ?
                                                            t("usernameOrEmail") :
                                                            t("email")
                                                    )
                                            }

                                        </label>
                                        <input
                                            tabIndex={1}
                                            id="username"
                                            className={cx(properties.kcInputClass)}
                                            name="username"
                                            value={login.username ?? ''}
                                            type="text"
                                            {...(usernameEditDisabled ? { "disabled": true } : { "autofocus": true, "autocomplete": "off" })}
                                        />
                                    </div>

                                    <div className={cx(properties.kcFormGroupClass)}>
                                        <label htmlFor="password" className={cx(properties.kcLabelClass)}>
                                            {t("password")}
                                        </label>
                                        <input tabIndex={2} id="password" className={cx(properties.kcInputClass)} name="password" type="password" autoComplete="off" />
                                    </div>

                                    <div className={cx(properties.kcFormGroupClass, properties.kcFormSettingClass)}>
                                        <div id="kc-form-options">
                                            {
                                                (
                                                    realm.rememberMe &&
                                                    !usernameEditDisabled
                                                ) &&
                                                <div className="checkbox">
                                                    <label>
                                                        <input tabIndex={3} id="rememberMe" name="rememberMe" type="checkbox" {...(login.rememberMe ? { "checked": true } : {})}> {t("rememberMe")}</input>
                                                    </label>
                                                </div>
                                            }
                                        </div>
                                        <div className={cx(properties.kcFormOptionsWrapperClass)}>
                                            {
                                                realm.resetPasswordAllowed &&
                                                <span>
                                                    <a tabIndex={5} href={url.loginResetCredentialsUrl}>{t("doForgotPassword")}</a>
                                                </span>
                                            }
                                        </div>

                                    </div>

                                    <div id="kc-form-buttons" className={cx(properties.kcFormGroupClass)}>
                                        <input
                                            type="hidden"
                                            id="id-hidden-input"
                                            name="credentialId"
                                            {...(auth?.selectedCredential !== undefined ? { "value": auth.selectedCredential } : {})}
                                        />
                                        <input
                                            tabIndex={4}
                                            className={cx(properties.kcButtonClass, properties.kcButtonPrimaryClass, properties.kcButtonBlockClass, properties.kcButtonLargeClass)} name="login" id="kc-login" type="submit"
                                            value={tStr("doLogIn")}
                                            disabled={isLoginButtonDisabled}
                                        />
                                    </div>
                                </form>
                            )
                        }
                    </div>
                    {
                        (realm.password && social.providers !== undefined) &&
                        <div id="kc-social-providers" className={cx(properties.kcFormSocialAccountContentClass, properties.kcFormSocialAccountClass)}>
                            <ul className={cx(properties.kcFormSocialAccountListClass, social.providers.length > 4 && properties.kcFormSocialAccountDoubleListClass)}>
                                {
                                    social.providers.map(p =>
                                        <li className={cx(properties.kcFormSocialAccountListLinkClass)}>
                                            <a href={p.loginUrl} id={`zocial-${p.alias}`} className={cx("zocial", p.providerId)}>
                                                <span>{p.displayName}</span>
                                            </a>
                                        </li>
                                    )
                                }
                            </ul>
                        </div>
                    }
                </div>
            }
            displayInfoNode={
                (
                    realm.password &&
                    realm.resetPasswordAllowed &&
                    !registrationDisabled
                ) &&
                <div id="kc-registration">
                    <span>
                        {t("noAccount")}
                        <a tabIndex={6} href={url.registrationUrl}>
                            {t("doRegister")}
                        </a>
                    </span>
                </div>
            }
        />
    );
});


