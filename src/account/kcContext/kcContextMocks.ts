import "minimal-polyfills/Object.fromEntries";
import { resources_common, keycloak_resources } from "keycloakify/bin/constants";
import { id } from "tsafe/id";
import type { KcContext } from "./KcContext";
import { BASE_URL } from "keycloakify/lib/BASE_URL";

const resourcesPath = `${BASE_URL}${keycloak_resources}/account/resources`;

export const kcContextCommonMock: KcContext.Common = {
    "themeVersion": "0.0.0",
    "keycloakifyVersion": "0.0.0",
    "themeType": "account",
    "themeName": "my-theme-name",
    "url": {
        resourcesPath,
        "resourcesCommonPath": `${resourcesPath}/${resources_common}`,
        "resourceUrl": "#",
        "accountUrl": "#",
        "applicationsUrl": "#",
        "getLogoutUrl": () => "#",
        "logUrl": "#",
        "passwordUrl": "#",
        "sessionsUrl": "#",
        "socialUrl": "#",
        "totpUrl": "#"
    },
    "realm": {
        "internationalizationEnabled": true,
        "userManagedAccessAllowed": true
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
    "features": {
        "authorization": true,
        "identityFederation": true,
        "log": true,
        "passwordUpdateSupported": true
    },
    "referrer": undefined,
    "account": {
        "firstName": "john",
        "lastName": "doe",
        "email": "john.doe@code.gouv.fr",
        "username": "doe_j"
    },
    "properties": {
        "parent": "account-v1",
        "kcButtonLargeClass": "btn-lg",
        "locales": "ar,ca,cs,da,de,en,es,fr,fi,hu,it,ja,lt,nl,no,pl,pt-BR,ru,sk,sv,tr,zh-CN",
        "kcButtonPrimaryClass": "btn-primary",
        "accountResourceProvider": "account-v1",
        "styles":
            "css/account.css img/icon-sidebar-active.png img/logo.png resources-common/node_modules/patternfly/dist/css/patternfly.min.css resources-common/node_modules/patternfly/dist/css/patternfly-additions.min.css resources-common/node_modules/patternfly/dist/css/patternfly-additions.min.css",
        "kcButtonClass": "btn",
        "kcButtonDefaultClass": "btn-default"
    },
    "sessions": {
        "sessions": [
            {
                "ipAddress": "127.0.0.1",
                "started": new Date().toString(),
                "lastAccess": new Date().toString(),
                "expires": new Date().toString(),
                "clients": ["Chrome", "Firefox"]
            }
        ]
    }
};

export const kcContextMocks: KcContext[] = [
    id<KcContext.Password>({
        ...kcContextCommonMock,
        "pageId": "password.ftl",
        "password": {
            "passwordSet": true
        },
        "stateChecker": "state checker"
    }),
    id<KcContext.Account>({
        ...kcContextCommonMock,
        "pageId": "account.ftl",
        "url": {
            ...kcContextCommonMock.url,
            "referrerURI": "#",
            "accountUrl": "#"
        },
        "realm": {
            ...kcContextCommonMock.realm,
            "registrationEmailAsUsername": true,
            "editUsernameAllowed": true
        },
        "stateChecker": ""
    }),
    id<KcContext.Sessions>({
        ...kcContextCommonMock,
        "pageId": "sessions.ftl",
        "sessions": {
            "sessions": [
                {
                    ...kcContextCommonMock.sessions,
                    "ipAddress": "127.0.0.1",
                    "started": new Date().toString(),
                    "lastAccess": new Date().toString(),
                    "expires": new Date().toString(),
                    "clients": ["Chrome", "Firefox"]
                }
            ]
        },
        "stateChecker": "g6WB1FaYnKotTkiy7ZrlxvFztSqS0U8jvHsOOOb2z4g"
    }),
    id<KcContext.Totp>({
        ...kcContextCommonMock,
        "pageId": "totp.ftl",
        "totp": {
            "enabled": true,
            "totpSecretEncoded": "KVVF G2BY N4YX S6LB IUYT K2LH IFYE 4SBV",
            "qrUrl": "#",
            "totpSecretQrCode":
                "iVBORw0KGgoAAAANSUhEUgAAAPYAAAD2AQAAAADNaUdlAAACM0lEQVR4Xu3OIZJgOQwDUDFd2UxiurLAVnnbHw4YGDKtSiWOn4Gxf81//7r/+q8b4HfLGBZDK9d85NmNR+sB42sXvOYrN5P1DcgYYFTGfOlbzE8gzwy3euweGizw7cfdl34/GRhlkxjKNV+5AebPXPORX1JuB9x8ZfbyyD2y1krWAKsbMq1HnqQDaLfa77p4+MqvzEGSqvSAD/2IHW2yHaigR9tX3m8dDIYGcNf3f+gDpVBZbZU77zyJ6Rlcy+qoTMG887KAPD9hsh6a1Sv3gJUHGHUAxSMzj7zqDDe7Phmt2eG+8UsMxjRGm816MAO+8VMl1R1jGHOrZB/5Zo/WXAPgxixm9Mo96vDGrM1eOto8c4Ax4wF437mifOXlpiPzCnN7Y9l95NnEMxgMY9AAGA8fucH14Y1aVb6N/cqrmyh0BVht7k1e+bU8LK0Cg5vmVq9c5vHIjOfqxDIfeTraNVTwewa4wVe+SW5N+uP1qACeudUZbqGOfA6VZV750Noq2Xx3kpveV44ZelSV1V7KFHzkWyVrrlUwG0Pl9pWnoy3vsQoME6vKI69i5osVgwWzHT7zjmJtMcNUSVn1oYMd7ZodbgowZl45VG0uVuLPUr1yc79uaQBag/mqR34xhlWyHm1prplHboCWdZ4TeZjsK8+dI+jbz1C5hl65mcpgB5dhcj8+dGO+0Ko68+lD37JDD83dpDLzzK+TrQyaVwGj6pUboGV+7+AyN8An/pf84/7rv/4/1l4OCc/1BYMAAAAASUVORK5CYII=",
            "manualUrl": "#",
            "totpSecret": "G4nsI8lQagRMUchH8jEG",
            "otpCredentials": [],
            "supportedApplications": ["totpAppFreeOTPName", "totpAppMicrosoftAuthenticatorName", "totpAppGoogleName"],
            "policy": {
                "algorithm": "HmacSHA1",
                "digits": 6,
                "lookAheadWindow": 1,
                "type": "totp",
                "period": 30
            }
        },
        "mode": "qr",
        "isAppInitiatedAction": false,
        "stateChecker": ""
    }),
    id<KcContext.Log>({
        ...kcContextCommonMock,
        "pageId": "log.ftl",
        "log": {
            "events": [
                {
                    "date": "2/21/2024, 1:28:39 PM",
                    "event": "login",
                    "ipAddress": "172.17.0.1",
                    "client": "security-admin-console",
                    "details": ["auth_method = openid-connect, username = admin"]
                }
            ]
        }
    })
];
