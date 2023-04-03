import "minimal-polyfills/Object.fromEntries";
import { mockTestingResourcesCommonPath, mockTestingResourcesPath } from "keycloakify/bin/mockTestingResourcesPath";
import { pathJoin } from "keycloakify/bin/tools/pathJoin";
import { id } from "tsafe/id";
import type { KcContext } from "./KcContext";

const PUBLIC_URL = process.env["PUBLIC_URL"] ?? "/";

export const kcContextCommonMock: KcContext.Common = {
    "keycloakifyVersion": "0.0.0",
    "url": {
        "resourcesPath": pathJoin(PUBLIC_URL, mockTestingResourcesPath),
        "resourcesCommonPath": pathJoin(PUBLIC_URL, mockTestingResourcesCommonPath),
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
    "message": {
        "type": "success",
        "summary": "This is a test message"
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
    })
];
