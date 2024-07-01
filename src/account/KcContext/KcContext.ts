import type { ThemeType, AccountThemePageId } from "keycloakify/bin/shared/constants";
import type { ValueOf } from "keycloakify/tools/ValueOf";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";

export type ExtendKcContext<
    KcContextExtension extends { properties?: Record<string, string | undefined> },
    KcContextExtensionPerPage extends Record<string, Record<string, unknown>>
> = ValueOf<{
    [PageId in keyof KcContextExtensionPerPage | KcContext["pageId"]]: Extract<
        KcContext,
        { pageId: PageId }
    > extends never
        ? KcContext.Common &
              KcContextExtension & {
                  pageId: PageId;
              } & KcContextExtensionPerPage[PageId]
        : Extract<KcContext, { pageId: PageId }> &
              KcContextExtension &
              KcContextExtensionPerPage[PageId];
}>;

export type KcContext =
    | KcContext.Password
    | KcContext.Account
    | KcContext.Sessions
    | KcContext.Totp
    | KcContext.Applications
    | KcContext.Log
    | KcContext.FederatedIdentity;

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
            logoutUrl: string;
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
            printIfExists: <T extends string>(
                fieldName: string,
                text: T
            ) => T | undefined;
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
                expires: string;
                clients: string[];
                ipAddress: string;
                started: string;
                lastAccess: string;
                id: string;
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
                getAlgorithmKey: () => string;
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
                realmRolesAvailable: {
                    name: string;
                    description: string;
                    compositesStream?: Record<string, unknown>;
                    clientRole?: boolean;
                    composite?: boolean;
                    id?: string;
                    containerId?: string;
                    attributes?: Record<string, unknown>;
                }[];
                resourceRolesAvailable: Record<
                    string,
                    {
                        roleName: string;
                        roleDescription?: string;
                        clientName: string;
                        clientId: string;
                    }[]
                >;
                additionalGrants: string[];
                clientScopesGranted: string[];
                effectiveUrl?: string;
                client: {
                    alwaysDisplayInConsole: boolean;
                    attributes: Record<string, unknown>;
                    authenticationFlowBindingOverrides: Record<string, unknown>;
                    baseUrl?: string;
                    bearerOnly: boolean;
                    clientAuthenticatorType: string;
                    clientId: string;
                    consentRequired: boolean;
                    consentScreenText: string;
                    description: string;
                    directAccessGrantsEnabled: boolean;
                    displayOnConsentScreen: boolean;
                    dynamicScope: boolean;
                    enabled: boolean;
                    frontchannelLogout: boolean;
                    fullScopeAllowed: boolean;
                    id: string;
                    implicitFlowEnabled: boolean;
                    includeInTokenScope: boolean;
                    managementUrl: string;
                    name?: string;
                    nodeReRegistrationTimeout: string;
                    notBefore: string;
                    protocol: string;
                    protocolMappersStream: Record<string, unknown>;
                    publicClient: boolean;
                    realm: Record<string, unknown>;
                    realmScopeMappingsStream: Record<string, unknown>;
                    redirectUris: string[];
                    registeredNodes: Record<string, unknown>;
                    rolesStream: Record<string, unknown>;
                    rootUrl?: string;
                    scopeMappingsStream: Record<string, unknown>;
                    secret: string;
                    serviceAccountsEnabled: boolean;
                    standardFlowEnabled: boolean;
                    surrogateAuthRequired: boolean;
                    webOrigins: string[];
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
                client: string;
                details: { value: string; key: string }[];
            }[];
        };
    };

    export type FederatedIdentity = Common & {
        pageId: "federatedIdentity.ftl";
        stateChecker: string;
        federatedIdentity: {
            identities: {
                providerId: string;
                displayName: string;
                userName: string;
                connected: boolean;
            }[];
            removeLinkPossible: boolean;
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
