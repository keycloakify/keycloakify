import "minimal-polyfills/Object.fromEntries";
import type { KcContext, Attribute } from "./KcContext";
import { mockTestingResourcesCommonPath, mockTestingResourcesPath } from "keycloakify/bin/mockTestingResourcesPath";
import { pathJoin } from "keycloakify/bin/tools/pathJoin";
import { id } from "tsafe/id";

const PUBLIC_URL = process.env["PUBLIC_URL"] ?? "/";

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

export const kcContextCommonMock: KcContext.Common = {
    "url": {
        "loginAction": "#",
        "resourcesPath": pathJoin(PUBLIC_URL, mockTestingResourcesPath),
        "resourcesCommonPath": pathJoin(PUBLIC_URL, mockTestingResourcesCommonPath),
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
        "clientId": "myApp"
    },
    "scripts": [],
    "message": {
        "type": "success",
        "summary": "This is a test message"
    },
    "isAppInitiatedAction": false
};

const loginUrl = {
    ...kcContextCommonMock.url,
    "loginResetCredentialsUrl": "/auth/realms/myrealm/login-actions/reset-credentials?client_id=account&tab_id=HoAx28ja4xg",
    "registrationUrl": "/auth/realms/myrealm/login-actions/registration?client_id=account&tab_id=HoAx28ja4xg"
};

export const kcContextMocks: KcContext[] = [
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
        "usernameEditDisabled": false,
        "login": {
            "rememberMe": false
        },
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
            "baseUrl": "#"
        }
    }),
    id<KcContext.Error>({
        ...kcContextCommonMock,
        "pageId": "error.ftl",
        "client": {
            "clientId": "myApp",
            "baseUrl": "#"
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
        }
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
        "login": {
            "rememberMe": false
        },
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
            policy: {
                supportedApplications: ["FreeOTP", "Google Authenticator"],
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
            "baseUrl": "#"
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
    })
];
