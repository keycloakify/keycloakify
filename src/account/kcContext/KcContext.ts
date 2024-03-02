import type { AccountThemePageId } from "keycloakify/bin/keycloakify/generateFtl";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import { type ThemeType } from "keycloakify/bin/constants";

export type KcContext = KcContext.Password | KcContext.Account | KcContext.Sessions | KcContext.Totp | KcContext.Applications | KcContext.Log;

export declare namespace KcContext {
    export type Common = {
        themeVersion: string;
        keycloakifyVersion: string;
        themeType: "account";
        themeName: string;
        locale?: {
            supported: {
                url: string;
                label: string;
                languageTag: string;
            }[];
            currentLanguageTag: string;
        };
        url: {
            accountUrl: string;
            passwordUrl: string;
            totpUrl: string;
            socialUrl: string;
            sessionsUrl: string;
            applicationsUrl: string;
            logUrl: string;
            resourceUrl: string;
            resourcesCommonPath: string;
            resourcesPath: string;
            /** @deprecated, not present in recent keycloak version apparently, use kcContext.referrer instead */
            referrerURI?: string;
            getLogoutUrl: () => string;
        };
        features: {
            passwordUpdateSupported: boolean;
            identityFederation: boolean;
            log: boolean;
            authorization: boolean;
        };
        realm: {
            internationalizationEnabled: boolean;
            userManagedAccessAllowed: boolean;
        };
        // Present only if redirected to account page with ?referrer=xxx&referrer_uri=http...
        message?: {
            type: "success" | "warning" | "error" | "info";
            summary: string;
        };
        referrer?: {
            url: string; // The url of the App
            name: string; // Client id
        };
        messagesPerField: {
            /**
             * Return text if message for given field exists. Useful eg. to add css styles for fields with message.
             *
             * @param fieldName to check for
             * @param text to return
             * @return text if message exists for given field, else undefined
             */
            printIfExists: <T extends string>(fieldName: string, text: T) => T | undefined;
            /**
             * Check if exists error message for given fields
             *
             * @param fields
             * @return boolean
             */
            existsError: (fieldName: string) => boolean;
            /**
             * Get message for given field.
             *
             * @param fieldName
             * @return message text or empty string
             */
            get: (fieldName: string) => string;
            /**
             * Check if message for given field exists
             *
             * @param field
             * @return boolean
             */
            exists: (fieldName: string) => boolean;
        };
        account: {
            email?: string;
            firstName: string;
            lastName?: string;
            username?: string;
        };
        properties: Record<string, string | undefined>;
        sessions: {
            sessions: {
                ipAddress: string;
                started?: any;
                lastAccess?: any;
                expires?: any;
                clients: string[];
            }[];
        };
    };

    export type Password = Common & {
        pageId: "password.ftl";
        password: {
            passwordSet: boolean;
        };
        stateChecker: string;
    };

    export type Account = Common & {
        pageId: "account.ftl";
        url: {
            accountUrl: string;
        };
        realm: {
            registrationEmailAsUsername: boolean;
            editUsernameAllowed: boolean;
        };
        stateChecker: string;
    };

    export type Sessions = Common & {
        pageId: "sessions.ftl";
        sessions: {
            sessions: {
                ipAddress: string;
                started?: any;
                lastAccess?: any;
                expires?: any;
                clients: string[];
            }[];
        };
        stateChecker: string;
    };

    export type Totp = Common & {
        pageId: "totp.ftl";
        totp: {
            enabled: boolean;
            totpSecretEncoded: string;
            qrUrl: string;
            policy: {
                algorithm: "HmacSHA1" | "HmacSHA256" | "HmacSHA512";
                digits: number;
                lookAheadWindow: number;
            } & (
                | {
                      type: "totp";
                      period: number;
                  }
                | {
                      type: "hotp";
                      initialCounter: number;
                  }
            );
            supportedApplications: string[];
            totpSecretQrCode: string;
            manualUrl: string;
            totpSecret: string;
            otpCredentials: { id: string; userLabel: string }[];
        };
        mode?: "qr" | "manual" | undefined | null;
        isAppInitiatedAction: boolean;
        url: {
            accountUrl: string;
            passwordUrl: string;
            totpUrl: string;
            socialUrl: string;
            sessionsUrl: string;
            applicationsUrl: string;
            logUrl: string;
            resourceUrl: string;
            resourcesCommonPath: string;
            resourcesPath: string;
            /** @deprecated, not present in recent keycloak version apparently, use kcContext.referrer instead */
            referrerURI?: string;
            getLogoutUrl: () => string;
        };
        stateChecker: string;
    };

    export type Applications = Common & {
        pageId: "applications.ftl";
        features: {
            log: boolean;
            identityFederation: boolean;
            authorization: boolean;
            passwordUpdateSupported: boolean;
        };
        stateChecker: string;
        applications: {
            applications: {
                realmRolesAvailable: { name: string; description: string }[];
                resourceRolesAvailable: Record<
                    string,
                    {
                        roleName: string;
                        roleDescription: string;
                        clientName: string;
                        clientId: string;
                    }[]
                >;
                additionalGrants: string[];
                clientScopesGranted: string[];
                effectiveUrl?: string;
                client: {
                    consentScreenText: string;
                    surrogateAuthRequired: boolean;
                    bearerOnly: boolean;
                    id: string;
                    protocolMappersStream: Record<string, unknown>;
                    includeInTokenScope: boolean;
                    redirectUris: string[];
                    fullScopeAllowed: boolean;
                    registeredNodes: Record<string, unknown>;
                    enabled: boolean;
                    clientAuthenticatorType: string;
                    realmScopeMappingsStream: Record<string, unknown>;
                    scopeMappingsStream: Record<string, unknown>;
                    displayOnConsentScreen: boolean;
                    clientId: string;
                    rootUrl: string;
                    authenticationFlowBindingOverrides: Record<string, unknown>;
                    standardFlowEnabled: boolean;
                    attributes: Record<string, unknown>;
                    publicClient: boolean;
                    alwaysDisplayInConsole: boolean;
                    consentRequired: boolean;
                    notBefore: string;
                    rolesStream: Record<string, unknown>;
                    protocol: string;
                    dynamicScope: boolean;
                    directAccessGrantsEnabled: boolean;
                    name: string;
                    serviceAccountsEnabled: boolean;
                    frontchannelLogout: boolean;
                    nodeReRegistrationTimeout: string;
                    implicitFlowEnabled: boolean;
                    baseUrl: string;
                    webOrigins: string[];
                    realm: Record<string, unknown>;
                };
            }[];
        };
    };

    export type Log = Common & {
        pageId: "log.ftl";
        log: {
            events: {
                date: string | number | Date;
                event: string;
                ipAddress: string;
                client: any;
                details: any[];
            }[];
        };
    };
}

{
    type Got = KcContext["pageId"];
    type Expected = AccountThemePageId;

    type OnlyInGot = Exclude<Got, Expected>;
    type OnlyInExpected = Exclude<Expected, Got>;

    assert<Equals<OnlyInGot, never>>();
    assert<Equals<OnlyInExpected, never>>();
}

assert<KcContext["themeType"] extends ThemeType ? true : false>();
