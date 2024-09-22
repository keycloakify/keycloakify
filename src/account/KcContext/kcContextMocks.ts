import "keycloakify/tools/Object.fromEntries";
import { WELL_KNOWN_DIRECTORY_BASE_NAME } from "keycloakify/bin/shared/constants";
import { id } from "tsafe/id";
import type { KcContext } from "./KcContext";
import { BASE_URL } from "keycloakify/lib/BASE_URL";
import { assert, type Equals } from "tsafe/assert";
import type { LanguageTag } from "keycloakify/account/i18n/messages_defaultSet/types";

const resourcesPath = `${BASE_URL}${WELL_KNOWN_DIRECTORY_BASE_NAME.KEYCLOAKIFY_DEV_RESOURCES}/account`;

export const kcContextCommonMock: KcContext.Common = {
    themeVersion: "0.0.0",
    keycloakifyVersion: "0.0.0",
    themeType: "account",
    themeName: "my-theme-name",
    url: {
        resourcesPath,
        resourcesCommonPath: `${resourcesPath}/${WELL_KNOWN_DIRECTORY_BASE_NAME.RESOURCES_COMMON}`,
        resourceUrl: "#",
        accountUrl: "#",
        applicationsUrl: "#",
        logoutUrl: "#",
        getLogoutUrl: () => "#",
        logUrl: "#",
        passwordUrl: "#",
        sessionsUrl: "#",
        socialUrl: "#",
        totpUrl: "#"
    },
    realm: {
        internationalizationEnabled: true,
        userManagedAccessAllowed: true
    },
    messagesPerField: {
        printIfExists: () => {
            return undefined;
        },
        existsError: () => false,
        get: key => `Fake error for ${key}`,
        exists: () => false
    },
    locale: {
        supported: (
            [
                /* spell-checker: disable */
                ["de", "Deutsch"],
                ["no", "Norsk"],
                ["ru", "Русский"],
                ["sv", "Svenska"],
                ["pt-BR", "Português (Brasil)"],
                ["lt", "Lietuvių"],
                ["en", "English"],
                ["it", "Italiano"],
                ["fr", "Français"],
                ["zh-CN", "中文简体"],
                ["es", "Español"],
                ["cs", "Čeština"],
                ["ja", "日本語"],
                ["sk", "Slovenčina"],
                ["pl", "Polski"],
                ["ca", "Català"],
                ["nl", "Nederlands"],
                ["tr", "Türkçe"],
                ["ar", "العربية"],
                ["da", "Dansk"],
                ["fi", "Suomi"],
                ["hu", "Magyar"],
                ["lv", "Latviešu"]
                /* spell-checker: enable */
            ] as const
        ).map(([languageTag, label]) => {
            {
                type Got = typeof languageTag;
                type Expected = LanguageTag;

                type Missing = Exclude<Expected, Got>;
                type Unexpected = Exclude<Got, Expected>;

                assert<Equals<Missing, never>>;
                assert<Equals<Unexpected, never>>;
            }

            return {
                languageTag,
                label,
                url: "https://gist.github.com/garronej/52baaca1bb925f2296ab32741e062b8e"
            } as const;
        }),

        currentLanguageTag: "en"
    },
    features: {
        authorization: true,
        identityFederation: true,
        log: true,
        passwordUpdateSupported: true
    },
    referrer: undefined,
    account: {
        firstName: "john",
        lastName: "doe",
        email: "john.doe@code.gouv.fr",
        username: "doe_j"
    },
    properties: {},
    "x-keycloakify": {
        messages: {}
    }
};

export const kcContextMocks: KcContext[] = [
    id<KcContext.Password>({
        ...kcContextCommonMock,
        pageId: "password.ftl",
        password: {
            passwordSet: true
        },
        stateChecker: "state checker"
    }),
    id<KcContext.Account>({
        ...kcContextCommonMock,
        pageId: "account.ftl",
        url: {
            ...kcContextCommonMock.url,
            referrerURI: "#",
            accountUrl: "#"
        },
        realm: {
            ...kcContextCommonMock.realm,
            registrationEmailAsUsername: true,
            editUsernameAllowed: true
        },
        stateChecker: ""
    }),
    id<KcContext.Sessions>({
        ...kcContextCommonMock,
        pageId: "sessions.ftl",
        sessions: {
            sessions: [
                {
                    ipAddress: "127.0.0.1",
                    started: new Date().toString(),
                    lastAccess: new Date().toString(),
                    expires: new Date().toString(),
                    clients: ["Chrome", "Firefox"],
                    id: "f8951177-817d-4a70-9c02-86d3c170fe51"
                }
            ]
        },
        stateChecker: "g6WB1FaYnKotTkiy7ZrlxvFztSqS0U8jvHsOOOb2z4g"
    }),
    id<KcContext.Totp>({
        ...kcContextCommonMock,
        pageId: "totp.ftl",
        totp: {
            enabled: true,
            totpSecretEncoded: "KVVF G2BY N4YX S6LB IUYT K2LH IFYE 4SBV",
            qrUrl: "#",
            totpSecretQrCode:
                "iVBORw0KGgoAAAANSUhEUgAAAPYAAAD2AQAAAADNaUdlAAACM0lEQVR4Xu3OIZJgOQwDUDFd2UxiurLAVnnbHw4YGDKtSiWOn4Gxf81//7r/+q8b4HfLGBZDK9d85NmNR+sB42sXvOYrN5P1DcgYYFTGfOlbzE8gzwy3euweGizw7cfdl34/GRhlkxjKNV+5AebPXPORX1JuB9x8ZfbyyD2y1krWAKsbMq1HnqQDaLfa77p4+MqvzEGSqvSAD/2IHW2yHaigR9tX3m8dDIYGcNf3f+gDpVBZbZU77zyJ6Rlcy+qoTMG887KAPD9hsh6a1Sv3gJUHGHUAxSMzj7zqDDe7Phmt2eG+8UsMxjRGm816MAO+8VMl1R1jGHOrZB/5Zo/WXAPgxixm9Mo96vDGrM1eOto8c4Ax4wF437mifOXlpiPzCnN7Y9l95NnEMxgMY9AAGA8fucH14Y1aVb6N/cqrmyh0BVht7k1e+bU8LK0Cg5vmVq9c5vHIjOfqxDIfeTraNVTwewa4wVe+SW5N+uP1qACeudUZbqGOfA6VZV750Noq2Xx3kpveV44ZelSV1V7KFHzkWyVrrlUwG0Pl9pWnoy3vsQoME6vKI69i5osVgwWzHT7zjmJtMcNUSVn1oYMd7ZodbgowZl45VG0uVuLPUr1yc79uaQBag/mqR34xhlWyHm1prplHboCWdZ4TeZjsK8+dI+jbz1C5hl65mcpgB5dhcj8+dGO+0Ko68+lD37JDD83dpDLzzK+TrQyaVwGj6pUboGV+7+AyN8An/pf84/7rv/4/1l4OCc/1BYMAAAAASUVORK5CYII=",
            manualUrl: "#",
            totpSecret: "G4nsI8lQagRMUchH8jEG",
            otpCredentials: [],
            supportedApplications: [
                "totpAppFreeOTPName",
                "totpAppMicrosoftAuthenticatorName",
                "totpAppGoogleName"
            ],
            policy: {
                algorithm: "HmacSHA1",
                digits: 6,
                lookAheadWindow: 1,
                type: "totp",
                period: 30,
                getAlgorithmKey: () => "SHA1"
            }
        },
        mode: "qr",
        isAppInitiatedAction: false,
        stateChecker: ""
    }),
    id<KcContext.Log>({
        ...kcContextCommonMock,
        pageId: "log.ftl",
        log: {
            events: [
                {
                    date: "2/21/2024, 1:28:39 PM",
                    event: "login",
                    ipAddress: "172.17.0.1",
                    client: "security-admin-console",
                    details: [{ key: "openid-connect", value: "admin" }]
                }
            ]
        }
    }),
    id<KcContext.FederatedIdentity>({
        ...kcContextCommonMock,
        stateChecker: "",
        pageId: "federatedIdentity.ftl",
        federatedIdentity: {
            identities: [
                {
                    providerId: "keycloak-oidc",
                    displayName: "keycloak-oidc",
                    userName: "John",
                    connected: true
                }
            ],
            removeLinkPossible: true
        }
    })
];
