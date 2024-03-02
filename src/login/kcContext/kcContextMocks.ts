import "minimal-polyfills/Object.fromEntries";
import type { KcContext, Attribute } from "./KcContext";
import { resources_common, keycloak_resources } from "keycloakify/bin/constants";
import { id } from "tsafe/id";
import { assert, type Equals } from "tsafe/assert";
import type { LoginThemePageId } from "keycloakify/bin/keycloakify/generateFtl";
import { BASE_URL } from "keycloakify/lib/BASE_URL";

const attributes: Attribute[] = [
    {
        "validators": {
            "username-prohibited-characters": {
                "ignore.empty.value": true
            },
            "up-username-has-value": {},
            "length": {
                "ignore.empty.value": true,
                "min": "3",
                "max": "255"
            },
            "up-duplicate-username": {},
            "up-username-mutation": {}
        },
        "displayName": "${username}",
        "annotations": {},
        "required": true,
        "groupAnnotations": {},
        "autocomplete": "username",
        "readOnly": false,
        "name": "username",
        "value": "xxxx"
    },
    {
        "validators": {
            "up-email-exists-as-username": {},
            "length": {
                "max": "255",
                "ignore.empty.value": true
            },
            "up-blank-attribute-value": {
                "error-message": "missingEmailMessage",
                "fail-on-null": false
            },
            "up-duplicate-email": {},
            "email": {
                "ignore.empty.value": true
            },
            "pattern": {
                "ignore.empty.value": true,
                "pattern": "gmail\\.com$"
            }
        },
        "displayName": "${email}",
        "annotations": {},
        "required": true,
        "groupAnnotations": {},
        "autocomplete": "email",
        "readOnly": false,
        "name": "email"
    },
    {
        "validators": {
            "length": {
                "max": "255",
                "ignore.empty.value": true
            },
            "person-name-prohibited-characters": {
                "ignore.empty.value": true
            },
            "up-immutable-attribute": {},
            "up-attribute-required-by-metadata-value": {}
        },
        "displayName": "${firstName}",
        "annotations": {},
        "required": true,
        "groupAnnotations": {},
        "readOnly": false,
        "name": "firstName"
    },
    {
        "validators": {
            "length": {
                "max": "255",
                "ignore.empty.value": true
            },
            "person-name-prohibited-characters": {
                "ignore.empty.value": true
            },
            "up-immutable-attribute": {},
            "up-attribute-required-by-metadata-value": {}
        },
        "displayName": "${lastName}",
        "annotations": {},
        "required": true,
        "groupAnnotations": {},
        "readOnly": false,
        "name": "lastName"
    }
];

const attributesByName = Object.fromEntries(attributes.map(attribute => [attribute.name, attribute])) as any;

const resourcesPath = `${BASE_URL}${keycloak_resources}/login/resources`;

export const kcContextCommonMock: KcContext.Common = {
    "themeVersion": "0.0.0",
    "keycloakifyVersion": "0.0.0",
    "themeType": "login",
    "themeName": "my-theme-name",
    "url": {
        "loginAction": "#",
        resourcesPath,
        "resourcesCommonPath": `${resourcesPath}/${resources_common}`,
        "loginRestartFlowUrl": "/auth/realms/myrealm/login-actions/restart?client_id=account&tab_id=HoAx28ja4xg",
        "loginUrl": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg"
    },
    "realm": {
        "name": "myrealm",
        "displayName": "myrealm",
        "displayNameHtml": "myrealm",
        "internationalizationEnabled": true,
        "registrationEmailAsUsername": false
    },
    "messagesPerField": {
        "printIfExists": () => {
            return undefined;
        },
        "existsError": () => false,
        "get": key => `Fake error for ${key}`,
        "exists": () => false
    },
    "locale": {
        "supported": [
            /* spell-checker: disable */
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=de",
                "label": "Deutsch",
                "languageTag": "de"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=no",
                "label": "Norsk",
                "languageTag": "no"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=ru",
                "label": "Русский",
                "languageTag": "ru"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=sv",
                "label": "Svenska",
                "languageTag": "sv"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=pt-BR",
                "label": "Português (Brasil)",
                "languageTag": "pt-BR"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=lt",
                "label": "Lietuvių",
                "languageTag": "lt"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=en",
                "label": "English",
                "languageTag": "en"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=it",
                "label": "Italiano",
                "languageTag": "it"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=fr",
                "label": "Français",
                "languageTag": "fr"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=zh-CN",
                "label": "中文简体",
                "languageTag": "zh-CN"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=es",
                "label": "Español",
                "languageTag": "es"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=cs",
                "label": "Čeština",
                "languageTag": "cs"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=ja",
                "label": "日本語",
                "languageTag": "ja"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=sk",
                "label": "Slovenčina",
                "languageTag": "sk"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=pl",
                "label": "Polski",
                "languageTag": "pl"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=ca",
                "label": "Català",
                "languageTag": "ca"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=nl",
                "label": "Nederlands",
                "languageTag": "nl"
            },
            {
                "url": "/auth/realms/myrealm/login-actions/authenticate?client_id=account&tab_id=HoAx28ja4xg&execution=ee6c2834-46a4-4a20-a1b6-f6d6f6451b36&kc_locale=tr",
                "label": "Türkçe",
                "languageTag": "tr"
            }
            /* spell-checker: enable */
        ],
        "currentLanguageTag": "en"
    },
    "auth": {
        "showUsername": false,
        "showResetCredentials": false,
        "showTryAnotherWayLink": false
    },
    "client": {
        "clientId": "myApp",
        "attributes": {}
    },
    "scripts": [],
    "isAppInitiatedAction": false,
    "properties": {
        "kcLogoIdP-facebook": "fa fa-facebook",
        "parent": "keycloak",
        "kcAuthenticatorOTPClass": "fa fa-mobile list-view-pf-icon-lg",
        "kcLogoIdP-bitbucket": "fa fa-bitbucket",
        "kcAuthenticatorWebAuthnClass": "fa fa-key list-view-pf-icon-lg",
        "kcWebAuthnDefaultIcon": "pficon pficon-key",
        "kcLogoIdP-stackoverflow": "fa fa-stack-overflow",
        "kcSelectAuthListItemClass": "pf-l-stack__item select-auth-box-parent pf-l-split",
        "kcLogoIdP-microsoft": "fa fa-windows",
        "kcLocaleItemClass": "pf-c-dropdown__menu-item",
        "kcLoginOTPListItemHeaderClass": "pf-c-tile__header",
        "kcLoginOTPListItemIconBodyClass": "pf-c-tile__icon",
        "kcInputHelperTextAfterClass": "pf-c-form__helper-text pf-c-form__helper-text-after",
        "kcFormClass": "form-horizontal",
        "kcSelectAuthListClass": "pf-l-stack select-auth-container",
        "kcInputClassRadioCheckboxLabelDisabled": "pf-m-disabled",
        "kcSelectAuthListItemIconClass": "pf-l-split__item select-auth-box-icon",
        "kcRecoveryCodesWarning": "kc-recovery-codes-warning",
        "kcFormSettingClass": "login-pf-settings",
        "kcWebAuthnBLE": "fa fa-bluetooth-b",
        "kcInputWrapperClass": "col-xs-12 col-sm-12 col-md-12 col-lg-12",
        "kcSelectAuthListItemArrowIconClass": "fa fa-angle-right fa-lg",
        "meta": "viewport==width=device-width,initial-scale=1",
        "styles": "css/login.css css/tile.css",
        "kcFeedbackAreaClass": "col-md-12",
        "kcLogoIdP-google": "fa fa-google",
        "kcCheckLabelClass": "pf-c-check__label",
        "kcSelectAuthListItemFillClass": "pf-l-split__item pf-m-fill",
        "kcAuthenticatorDefaultClass": "fa fa-list list-view-pf-icon-lg",
        "kcLogoIdP-gitlab": "fa fa-gitlab",
        "kcFormAreaClass": "col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 col-lg-8 col-lg-offset-2",
        "kcFormButtonsClass": "col-xs-12 col-sm-12 col-md-12 col-lg-12",
        "kcInputClassRadioLabel": "pf-c-radio__label",
        "kcAuthenticatorWebAuthnPasswordlessClass": "fa fa-key list-view-pf-icon-lg",
        "kcSelectAuthListItemHeadingClass": "pf-l-stack__item select-auth-box-headline pf-c-title",
        "kcInfoAreaClass": "col-xs-12 col-sm-4 col-md-4 col-lg-5 details",
        "kcLogoLink": "http://www.keycloak.org",
        "kcContainerClass": "container-fluid",
        "kcSelectAuthListItemTitle": "select-auth-box-paragraph",
        "kcHtmlClass": "login-pf",
        "kcLoginOTPListItemTitleClass": "pf-c-tile__title",
        "locales": "ca,cs,da,de,en,es,fr,fi,hu,it,ja,lt,nl,no,pl,pt-BR,ru,sk,sv,tr,zh-CN",
        "serviceTitle": "CodeGouv",
        "kcLogoIdP-openshift-v4": "pf-icon pf-icon-openshift",
        "kcWebAuthnUnknownIcon": "pficon pficon-key unknown-transport-class",
        "kcFormSocialAccountNameClass": "kc-social-provider-name",
        "kcLogoIdP-openshift-v3": "pf-icon pf-icon-openshift",
        "kcLoginOTPListInputClass": "pf-c-tile__input",
        "kcWebAuthnUSB": "fa fa-usb",
        "kcInputClassRadio": "pf-c-radio",
        "kcWebAuthnKeyIcon": "pficon pficon-key",
        "kcFeedbackInfoIcon": "fa fa-fw fa-info-circle",
        "kcCommonLogoIdP": "kc-social-provider-logo kc-social-gray",
        "stylesCommon":
            "web_modules/@patternfly/react-core/dist/styles/base.css web_modules/@patternfly/react-core/dist/styles/app.css node_modules/patternfly/dist/css/patternfly.min.css node_modules/patternfly/dist/css/patternfly-additions.min.css lib/pficon/pficon.css",
        "kcRecoveryCodesActions": "kc-recovery-codes-actions",
        "kcFormGroupHeader": "pf-c-form__group",
        "kcFormSocialAccountSectionClass": "kc-social-section kc-social-gray",
        "kcLogoIdP-instagram": "fa fa-instagram",
        "kcAlertClass": "pf-c-alert pf-m-inline",
        "kcHeaderClass": "login-pf-page-header",
        "kcLabelWrapperClass": "col-xs-12 col-sm-12 col-md-12 col-lg-12",
        "kcFormSocialAccountLinkClass": "pf-c-login__main-footer-links-item-link",
        "kcLocaleMainClass": "pf-c-dropdown",
        "kcTextareaClass": "form-control",
        "kcButtonBlockClass": "pf-m-block",
        "kcButtonClass": "pf-c-button",
        "kcWebAuthnNFC": "fa fa-wifi",
        "kcLocaleClass": "col-xs-12 col-sm-1",
        "kcInputClassCheckboxInput": "pf-c-check__input",
        "kcFeedbackErrorIcon": "fa fa-fw fa-exclamation-circle",
        "kcInputLargeClass": "input-lg",
        "kcInputErrorMessageClass": "pf-c-form__helper-text pf-m-error required kc-feedback-text",
        "kcRecoveryCodesList": "kc-recovery-codes-list",
        "kcFormSocialAccountListClass": "pf-c-login__main-footer-links kc-social-links",
        "kcAlertTitleClass": "pf-c-alert__title kc-feedback-text",
        "kcAuthenticatorPasswordClass": "fa fa-unlock list-view-pf-icon-lg",
        "kcCheckInputClass": "pf-c-check__input",
        "kcLogoIdP-linkedin": "fa fa-linkedin",
        "kcLogoIdP-twitter": "fa fa-twitter",
        "kcFeedbackWarningIcon": "fa fa-fw fa-exclamation-triangle",
        "kcResetFlowIcon": "pficon pficon-arrow fa",
        "kcSelectAuthListItemIconPropertyClass": "fa-2x select-auth-box-icon-properties",
        "kcFeedbackSuccessIcon": "fa fa-fw fa-check-circle",
        "kcLoginOTPListClass": "pf-c-tile",
        "kcSrOnlyClass": "sr-only",
        "kcFormSocialAccountListGridClass": "pf-l-grid kc-social-grid",
        "kcButtonDefaultClass": "btn-default",
        "kcFormGroupErrorClass": "has-error",
        "kcSelectAuthListItemDescriptionClass": "pf-l-stack__item select-auth-box-desc",
        "kcSelectAuthListItemBodyClass": "pf-l-split__item pf-l-stack",
        "import": "common/keycloak",
        "kcWebAuthnInternal": "pficon pficon-key",
        "kcSelectAuthListItemArrowClass": "pf-l-split__item select-auth-box-arrow",
        "kcCheckClass": "pf-c-check",
        "kcContentClass": "col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3 col-lg-6 col-lg-offset-3",
        "kcLogoClass": "login-pf-brand",
        "kcLoginOTPListItemIconClass": "fa fa-mobile",
        "kcLoginClass": "login-pf-page",
        "kcSignUpClass": "login-pf-signup",
        "kcButtonLargeClass": "btn-lg",
        "kcFormCardClass": "card-pf",
        "kcLocaleListClass": "pf-c-dropdown__menu pf-m-align-right",
        "kcInputClass": "pf-c-form-control",
        "kcFormGroupClass": "form-group",
        "kcLogoIdP-paypal": "fa fa-paypal",
        "kcInputClassCheckbox": "pf-c-check",
        "kcRecoveryCodesConfirmation": "kc-recovery-codes-confirmation",
        "kcInputClassRadioInput": "pf-c-radio__input",
        "kcFormSocialAccountListButtonClass": "pf-c-button pf-m-control pf-m-block kc-social-item kc-social-gray",
        "kcInputClassCheckboxLabel": "pf-c-check__label",
        "kcFormOptionsClass": "col-xs-12 col-sm-12 col-md-12 col-lg-12",
        "kcFormHeaderClass": "login-pf-header",
        "kcFormSocialAccountGridItem": "pf-l-grid__item",
        "kcButtonPrimaryClass": "pf-m-primary",
        "kcInputHelperTextBeforeClass": "pf-c-form__helper-text pf-c-form__helper-text-before",
        "kcLogoIdP-github": "fa fa-github",
        "kcLabelClass": "pf-c-form__label pf-c-form__label-text"
    }
};

const loginUrl = {
    ...kcContextCommonMock.url,
    "loginResetCredentialsUrl": "/auth/realms/myrealm/login-actions/reset-credentials?client_id=account&tab_id=HoAx28ja4xg",
    "registrationUrl": "/auth/realms/myrealm/login-actions/registration?client_id=account&tab_id=HoAx28ja4xg",
    "oauth2DeviceVerificationAction": "/auth/realms/myrealm/device",
    "oauthAction": "/auth/realms/myrealm/login-actions/consent?client_id=account&tab_id=HoAx28ja4xg"
};

export const kcContextMocks = [
    id<KcContext.Login>({
        ...kcContextCommonMock,
        "pageId": "login.ftl",
        "url": loginUrl,
        "realm": {
            ...kcContextCommonMock.realm,
            "loginWithEmailAllowed": true,
            "rememberMe": true,
            "password": true,
            "resetPasswordAllowed": true,
            "registrationAllowed": true
        },
        "auth": kcContextCommonMock.auth!,
        "social": {
            "displayInfo": true
        },
        "usernameHidden": false,
        "login": {},
        "registrationDisabled": false
    }),
    ...(() => {
        const registerCommon: KcContext.RegisterUserProfile.CommonWithLegacy = {
            ...kcContextCommonMock,
            "url": {
                ...loginUrl,
                "registrationAction":
                    "http://localhost:8080/auth/realms/myrealm/login-actions/registration?session_code=gwZdUeO7pbYpFTRxiIxRg_QtzMbtFTKrNu6XW_f8asM&execution=12146ce0-b139-4bbd-b25b-0eccfee6577e&client_id=account&tab_id=uS8lYfebLa0"
            },
            "scripts": [],
            "isAppInitiatedAction": false,
            "passwordRequired": true,
            "recaptchaRequired": false,
            "social": {
                "displayInfo": true
            }
        };

        return [
            id<KcContext.Register>({
                "pageId": "register.ftl",
                ...registerCommon,
                "register": {
                    "formData": {}
                }
            }),
            id<KcContext.RegisterUserProfile>({
                "pageId": "register-user-profile.ftl",
                ...registerCommon,
                "profile": {
                    "context": "REGISTRATION_PROFILE" as const,
                    attributes,
                    attributesByName
                }
            })
        ];
    })(),
    id<KcContext.Info>({
        ...kcContextCommonMock,
        "pageId": "info.ftl",
        "messageHeader": "<Message header>",
        "requiredActions": undefined,
        "skipLink": false,
        "actionUri": "#",
        "client": {
            "clientId": "myApp",
            "baseUrl": "#",
            "attributes": {}
        }
    }),
    id<KcContext.Error>({
        ...kcContextCommonMock,
        "pageId": "error.ftl",
        "client": {
            "clientId": "myApp",
            "baseUrl": "#",
            "attributes": {}
        },
        "message": {
            "type": "error",
            "summary": "This is the error message"
        }
    }),
    id<KcContext.LoginResetPassword>({
        ...kcContextCommonMock,
        "pageId": "login-reset-password.ftl",
        "realm": {
            ...kcContextCommonMock.realm,
            "loginWithEmailAllowed": false
        },
        url: loginUrl
    }),
    id<KcContext.LoginVerifyEmail>({
        ...kcContextCommonMock,
        "pageId": "login-verify-email.ftl",
        "user": {
            "email": "john.doe@gmail.com"
        }
    }),
    id<KcContext.Terms>({
        ...kcContextCommonMock,
        "pageId": "terms.ftl"
    }),
    id<KcContext.LoginDeviceVerifyUserCode>({
        ...kcContextCommonMock,
        "pageId": "login-oauth2-device-verify-user-code.ftl",
        url: loginUrl
    }),
    id<KcContext.LoginOauthGrant>({
        ...kcContextCommonMock,
        "pageId": "login-oauth-grant.ftl",
        oauth: {
            code: "5-1N4CIzfi1aprIQjmylI-9e3spLCWW9i5d-GDcs-Sw",
            clientScopesRequested: [
                { consentScreenText: "${profileScopeConsentText}" },
                { consentScreenText: "${rolesScopeConsentText}" },
                { consentScreenText: "${emailScopeConsentText}" }
            ],
            client: "account"
        },
        url: loginUrl
    }),
    id<KcContext.LoginOtp>({
        ...kcContextCommonMock,
        "pageId": "login-otp.ftl",
        "otpLogin": {
            "userOtpCredentials": [
                {
                    "id": "id1",
                    "userLabel": "label1"
                },
                {
                    "id": "id2",
                    "userLabel": "label2"
                }
            ]
        }
    }),
    id<KcContext.LoginUsername>({
        ...kcContextCommonMock,
        "pageId": "login-username.ftl",
        "url": loginUrl,
        "realm": {
            ...kcContextCommonMock.realm,
            "loginWithEmailAllowed": true,
            "rememberMe": true,
            "password": true,
            "resetPasswordAllowed": true,
            "registrationAllowed": true
        },
        "social": {
            "displayInfo": true
        },
        "usernameHidden": false,
        "login": {},
        "registrationDisabled": false
    }),
    id<KcContext.LoginPassword>({
        ...kcContextCommonMock,
        "pageId": "login-password.ftl",
        "url": loginUrl,
        "realm": {
            ...kcContextCommonMock.realm,
            "resetPasswordAllowed": true
        },
        "social": {
            "displayInfo": false
        },
        "login": {}
    }),
    id<KcContext.WebauthnAuthenticate>({
        ...kcContextCommonMock,
        "pageId": "webauthn-authenticate.ftl",
        "url": loginUrl,
        "authenticators": {
            "authenticators": []
        },
        "realm": {
            ...kcContextCommonMock.realm
        },
        "challenge": "",
        "userVerification": "not specified",
        "rpId": "",
        "createTimeout": "0",
        "isUserIdentified": "false",
        "shouldDisplayAuthenticators": false,
        "social": {
            "displayInfo": false
        },
        "login": {}
    }),
    id<KcContext.LoginUpdatePassword>({
        ...kcContextCommonMock,
        "pageId": "login-update-password.ftl",
        "username": "anUsername"
    }),
    id<KcContext.LoginUpdateProfile>({
        ...kcContextCommonMock,
        "pageId": "login-update-profile.ftl",
        "user": {
            "editUsernameAllowed": true,
            "username": "anUsername",
            "email": "foo@example.com",
            "firstName": "aFirstName",
            "lastName": "aLastName"
        }
    }),
    id<KcContext.LoginIdpLinkConfirm>({
        ...kcContextCommonMock,
        "pageId": "login-idp-link-confirm.ftl",
        "idpAlias": "FranceConnect"
    }),
    id<KcContext.LoginIdpLinkEmail>({
        ...kcContextCommonMock,
        "pageId": "login-idp-link-email.ftl",
        "idpAlias": "FranceConnect",
        "brokerContext": {
            "username": "anUsername"
        }
    }),
    id<KcContext.LoginConfigTotp>({
        ...kcContextCommonMock,
        "pageId": "login-config-totp.ftl",
        totp: {
            totpSecretEncoded: "KVVF G2BY N4YX S6LB IUYT K2LH IFYE 4SBV",
            qrUrl: "#",
            totpSecretQrCode:
                "iVBORw0KGgoAAAANSUhEUgAAAPYAAAD2AQAAAADNaUdlAAACM0lEQVR4Xu3OIZJgOQwDUDFd2UxiurLAVnnbHw4YGDKtSiWOn4Gxf81//7r/+q8b4HfLGBZDK9d85NmNR+sB42sXvOYrN5P1DcgYYFTGfOlbzE8gzwy3euweGizw7cfdl34/GRhlkxjKNV+5AebPXPORX1JuB9x8ZfbyyD2y1krWAKsbMq1HnqQDaLfa77p4+MqvzEGSqvSAD/2IHW2yHaigR9tX3m8dDIYGcNf3f+gDpVBZbZU77zyJ6Rlcy+qoTMG887KAPD9hsh6a1Sv3gJUHGHUAxSMzj7zqDDe7Phmt2eG+8UsMxjRGm816MAO+8VMl1R1jGHOrZB/5Zo/WXAPgxixm9Mo96vDGrM1eOto8c4Ax4wF437mifOXlpiPzCnN7Y9l95NnEMxgMY9AAGA8fucH14Y1aVb6N/cqrmyh0BVht7k1e+bU8LK0Cg5vmVq9c5vHIjOfqxDIfeTraNVTwewa4wVe+SW5N+uP1qACeudUZbqGOfA6VZV750Noq2Xx3kpveV44ZelSV1V7KFHzkWyVrrlUwG0Pl9pWnoy3vsQoME6vKI69i5osVgwWzHT7zjmJtMcNUSVn1oYMd7ZodbgowZl45VG0uVuLPUr1yc79uaQBag/mqR34xhlWyHm1prplHboCWdZ4TeZjsK8+dI+jbz1C5hl65mcpgB5dhcj8+dGO+0Ko68+lD37JDD83dpDLzzK+TrQyaVwGj6pUboGV+7+AyN8An/pf84/7rv/4/1l4OCc/1BYMAAAAASUVORK5CYII=",
            manualUrl: "#",
            totpSecret: "G4nsI8lQagRMUchH8jEG",
            otpCredentials: [],
            supportedApplications: ["FreeOTP", "Google Authenticator"],
            policy: {
                algorithm: "HmacSHA1",
                digits: 6,
                lookAheadWindow: 1,
                type: "totp",
                period: 30
            }
        }
    }),
    id<KcContext.LogoutConfirm>({
        ...kcContextCommonMock,
        "pageId": "logout-confirm.ftl",
        "url": {
            ...kcContextCommonMock.url,
            "logoutConfirmAction": "Continuer?"
        },
        "client": {
            "clientId": "myApp",
            "baseUrl": "#",
            "attributes": {}
        },
        "logoutConfirm": { "code": "123", skipLink: false }
    }),
    id<KcContext.UpdateUserProfile>({
        ...kcContextCommonMock,
        "pageId": "update-user-profile.ftl",
        "profile": {
            attributes,
            attributesByName
        }
    }),
    id<KcContext.IdpReviewUserProfile>({
        ...kcContextCommonMock,
        "pageId": "idp-review-user-profile.ftl",
        "profile": {
            context: "IDP_REVIEW",
            attributes,
            attributesByName
        }
    }),
    id<KcContext.UpdateEmail>({
        ...kcContextCommonMock,
        "pageId": "update-email.ftl",
        "email": {
            value: "email@example.com"
        }
    }),
    id<KcContext.SelectAuthenticator>({
        ...kcContextCommonMock,
        pageId: "select-authenticator.ftl",
        auth: {
            authenticationSelections: [
                {
                    authExecId: "f607f83c-537e-42b7-99d7-c52d459afe84",
                    displayName: "otp-display-name",
                    helpText: "otp-help-text",
                    iconCssClass: "kcAuthenticatorOTPClass"
                },
                {
                    authExecId: "5ed881b1-84cd-4e9b-b4d9-f329ea61a58c",
                    displayName: "webauthn-display-name",
                    helpText: "webauthn-help-text",
                    iconCssClass: "kcAuthenticatorWebAuthnClass"
                }
            ]
        }
    }),
    id<KcContext.SamlPostForm>({
        ...kcContextCommonMock,
        pageId: "saml-post-form.ftl",
        "samlPost": {
            "url": ""
        }
    }),
    id<KcContext.LoginPageExpired>({
        ...kcContextCommonMock,
        pageId: "login-page-expired.ftl"
    })
];

{
    type Got = (typeof kcContextMocks)[number]["pageId"];
    type Expected = LoginThemePageId;

    type OnlyInGot = Exclude<Got, Expected>;
    type OnlyInExpected = Exclude<Expected, Got>;

    assert<Equals<OnlyInGot, never>>();
    assert<Equals<OnlyInExpected, never>>();
}
