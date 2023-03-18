import type { LoginThemePageId, AccountThemePageId } from "../bin/keycloakify/generateFtl";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import type { MessageKeyBase } from "../i18n";

type ExtractAfterStartingWith<Prefix extends string, StrEnum> = StrEnum extends `${Prefix}${infer U}` ? U : never;

/** Take theses type definition with a grain of salt.
 * Some values might be undefined on some pages.
 * (ex: url.loginAction is undefined on error.ftl)
 */
export type KcContextBase =
    | KcContextBase.Login
    | KcContextBase.Register
    | KcContextBase.RegisterUserProfile
    | KcContextBase.Info
    | KcContextBase.Error
    | KcContextBase.LoginResetPassword
    | KcContextBase.LoginVerifyEmail
    | KcContextBase.Terms
    | KcContextBase.LoginOtp
    | KcContextBase.LoginUsername
    | KcContextBase.WebauthnAuthenticate
    | KcContextBase.LoginPassword
    | KcContextBase.LoginUpdatePassword
    | KcContextBase.LoginUpdateProfile
    | KcContextBase.LoginIdpLinkConfirm
    | KcContextBase.LoginIdpLinkEmail
    | KcContextBase.LoginPageExpired
    | KcContextBase.LoginConfigTotp
    | KcContextBase.LogoutConfirm
    | KcContextBase.UpdateUserProfile
    | KcContextBase.IdpReviewUserProfile
    | KcContextBase.Password;

export declare namespace KcContextBase {
    export namespace Common {
        export type Login = {
            url: {
                loginAction: string;
                resourcesPath: string;
                resourcesCommonPath: string;
                loginRestartFlowUrl: string;
                loginUrl: string;
            };
            realm: {
                name: string;
                displayName?: string;
                displayNameHtml?: string;
                internationalizationEnabled: boolean;
                registrationEmailAsUsername: boolean;
            };
            /** Undefined if !realm.internationalizationEnabled */
            locale?: {
                supported: {
                    url: string;
                    label: string;
                    languageTag: string;
                }[];
                currentLanguageTag: string;
            };
            auth?: {
                showUsername?: boolean;
                showResetCredentials?: boolean;
                showTryAnotherWayLink?: boolean;
                attemptedUsername?: string;
            };
            scripts: string[];
            message?: {
                type: "success" | "warning" | "error" | "info";
                summary: string;
            };
            client: {
                clientId: string;
                name?: string;
                description?: string;
            };
            isAppInitiatedAction: boolean;
            messagesPerField: {
                printIfExists: <T>(fieldName: string, x: T) => T | undefined;
                existsError: (fieldName: string) => boolean;
                get: (fieldName: string) => string;
                exists: (fieldName: string) => boolean;
            };
        };

        export type Account = {
            locale?: {
                currentLanguageTag: string;
                supported: { languageTag: string; url: string; label: string }[];
            };
            url: {
                resourcesPath: string;
                resourcesCommonPath: string;
            };
        };
    }

    export type Login = Common.Login & {
        pageId: "login.ftl";
        url: {
            loginResetCredentialsUrl: string;
            registrationUrl: string;
        };
        realm: {
            loginWithEmailAllowed: boolean;
            rememberMe: boolean;
            password: boolean;
            resetPasswordAllowed: boolean;
            registrationAllowed: boolean;
        };
        auth: {
            selectedCredential?: string;
        };
        registrationDisabled: boolean;
        login: {
            username?: string;
            rememberMe?: boolean;
        };
        usernameEditDisabled: boolean;
        social: {
            displayInfo: boolean;
            providers?: {
                loginUrl: string;
                alias: string;
                providerId: string;
                displayName: string;
            }[];
        };
    };

    export type Register = RegisterUserProfile.CommonWithLegacy & {
        pageId: "register.ftl";
        register: {
            formData: {
                firstName?: string;
                displayName?: string;
                lastName?: string;
                email?: string;
                username?: string;
            };
        };
    };

    export type RegisterUserProfile = RegisterUserProfile.CommonWithLegacy & {
        pageId: "register-user-profile.ftl";
        profile: {
            context: "REGISTRATION_PROFILE";
            attributes: Attribute[];
            attributesByName: Record<string, Attribute>;
        };
    };

    export namespace RegisterUserProfile {
        export type CommonWithLegacy = Common.Login & {
            url: {
                registrationAction: string;
            };
            passwordRequired: boolean;
            recaptchaRequired: boolean;
            recaptchaSiteKey?: string;
            social: {
                displayInfo: boolean;
                providers?: {
                    loginUrl: string;
                    alias: string;
                    providerId: string;
                    displayName: string;
                }[];
            };
        };
    }

    export type Info = Common.Login & {
        pageId: "info.ftl";
        messageHeader?: string;
        requiredActions?: ExtractAfterStartingWith<"requiredAction.", MessageKeyBase>[];
        skipLink: boolean;
        pageRedirectUri?: string;
        actionUri?: string;
        client: {
            baseUrl?: string;
        };
    };

    export type Error = Common.Login & {
        pageId: "error.ftl";
        client?: {
            baseUrl?: string;
        };
        message: NonNullable<Common.Login["message"]>;
    };

    export type LoginResetPassword = Common.Login & {
        pageId: "login-reset-password.ftl";
        realm: {
            loginWithEmailAllowed: boolean;
        };
    };

    export type LoginVerifyEmail = Common.Login & {
        pageId: "login-verify-email.ftl";
        //NOTE: Optional because maybe it wasn't defined in older keycloak versions.
        user?: {
            email: string;
        };
    };

    export type Terms = Common.Login & {
        pageId: "terms.ftl";
    };

    export type LoginOtp = Common.Login & {
        pageId: "login-otp.ftl";
        otpLogin: {
            userOtpCredentials: { id: string; userLabel: string }[];
        };
    };

    export type LoginUsername = Common.Login & {
        pageId: "login-username.ftl";
        url: {
            loginResetCredentialsUrl: string;
            registrationUrl: string;
        };
        realm: {
            loginWithEmailAllowed: boolean;
            rememberMe: boolean;
            password: boolean;
            resetPasswordAllowed: boolean;
            registrationAllowed: boolean;
        };
        registrationDisabled: boolean;
        login: {
            username?: string;
            rememberMe?: boolean;
        };
        usernameHidden?: boolean;
        social: {
            displayInfo: boolean;
            providers?: {
                loginUrl: string;
                alias: string;
                providerId: string;
                displayName: string;
            }[];
        };
    };

    export type LoginPassword = Common.Login & {
        pageId: "login-password.ftl";
        url: {
            loginResetCredentialsUrl: string;
            registrationUrl: string;
        };
        realm: {
            resetPasswordAllowed: boolean;
        };
        auth?: {
            showUsername?: boolean;
            showResetCredentials?: boolean;
            showTryAnotherWayLink?: boolean;
            attemptedUsername?: string;
        };
        social: {
            displayInfo: boolean;
        };
        login: {
            password?: string;
        };
    };

    export type WebauthnAuthenticate = Common.Login & {
        pageId: "webauthn-authenticate.ftl";
        authenticators: {
            authenticators: WebauthnAuthenticate.WebauthnAuthenticator[];
        };
        challenge: string;
        // I hate this:
        userVerification: UserVerificationRequirement | "not specified";
        rpId: string;
        createTimeout: string;
        isUserIdentified: "true" | "false";
        shouldDisplayAuthenticators: boolean;
        social: {
            displayInfo: boolean;
        };
        login: {};
    };

    export namespace WebauthnAuthenticate {
        export type WebauthnAuthenticator = {
            credentialId: string;
            transports: {
                iconClass: string;
                displayNameProperties: MessageKeyBase[];
            };
            label: string;
            createdAt: string;
        };
    }

    export type LoginUpdatePassword = Common.Login & {
        pageId: "login-update-password.ftl";
        username: string;
    };

    export type LoginUpdateProfile = Common.Login & {
        pageId: "login-update-profile.ftl";
        user: {
            editUsernameAllowed: boolean;
            username?: string;
            email?: string;
            firstName?: string;
            lastName?: string;
        };
    };

    export type LoginIdpLinkConfirm = Common.Login & {
        pageId: "login-idp-link-confirm.ftl";
        idpAlias: string;
    };

    export type LoginIdpLinkEmail = Common.Login & {
        pageId: "login-idp-link-email.ftl";
        brokerContext: {
            username: string;
        };
        idpAlias: string;
    };

    export type LoginPageExpired = Common.Login & {
        pageId: "login-page-expired.ftl";
    };

    export type LoginConfigTotp = Common.Login & {
        pageId: "login-config-totp.ftl";
        mode?: "qr" | "manual" | undefined | null;
        totp: {
            totpSecretEncoded: string;
            qrUrl: string;
            policy: {
                supportedApplications: string[];
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
            totpSecretQrCode: string;
            manualUrl: string;
            totpSecret: string;
            otpCredentials: { id: string; userLabel: string }[];
        };
    };

    export type LogoutConfirm = Common.Login & {
        pageId: "logout-confirm.ftl";
        url: {
            logoutConfirmAction: string;
        };
        client: {
            baseUrl?: string;
        };
        logoutConfirm: {
            code: string;
            skipLink?: boolean;
        };
    };

    export type UpdateUserProfile = Common.Login & {
        pageId: "update-user-profile.ftl";
        profile: {
            attributes: Attribute[];
            attributesByName: Record<string, Attribute>;
        };
    };

    export type IdpReviewUserProfile = Common.Login & {
        pageId: "idp-review-user-profile.ftl";
        profile: {
            context: "IDP_REVIEW";
            attributes: Attribute[];
            attributesByName: Record<string, Attribute>;
        };
    };

    export type Password = Common.Account & {
        pageId: "password.ftl";
        url: {
            passwordUrl: string;
        };
    };
}

export type Attribute = {
    name: string;
    displayName?: string;
    required: boolean;
    value?: string;
    group?: string;
    groupDisplayHeader?: string;
    groupDisplayDescription?: string;
    readOnly: boolean;
    validators: Validators;
    annotations: Record<string, string>;
    groupAnnotations: Record<string, string>;
    autocomplete?:
        | "on"
        | "off"
        | "name"
        | "honorific-prefix"
        | "given-name"
        | "additional-name"
        | "family-name"
        | "honorific-suffix"
        | "nickname"
        | "email"
        | "username"
        | "new-password"
        | "current-password"
        | "one-time-code"
        | "organization-title"
        | "organization"
        | "street-address"
        | "address-line1"
        | "address-line2"
        | "address-line3"
        | "address-level4"
        | "address-level3"
        | "address-level2"
        | "address-level1"
        | "country"
        | "country-name"
        | "postal-code"
        | "cc-name"
        | "cc-given-name"
        | "cc-additional-name"
        | "cc-family-name"
        | "cc-number"
        | "cc-exp"
        | "cc-exp-month"
        | "cc-exp-year"
        | "cc-csc"
        | "cc-type"
        | "transaction-currency"
        | "transaction-amount"
        | "language"
        | "bday"
        | "bday-day"
        | "bday-month"
        | "bday-year"
        | "sex"
        | "tel"
        | "tel-country-code"
        | "tel-national"
        | "tel-area-code"
        | "tel-local"
        | "tel-extension"
        | "impp"
        | "url"
        | "photo";
};

export type Validators = Partial<{
    length: Validators.DoIgnoreEmpty & Validators.Range;
    double: Validators.DoIgnoreEmpty & Validators.Range;
    integer: Validators.DoIgnoreEmpty & Validators.Range;
    email: Validators.DoIgnoreEmpty;
    "up-immutable-attribute": {};
    "up-attribute-required-by-metadata-value": {};
    "up-username-has-value": {};
    "up-duplicate-username": {};
    "up-username-mutation": {};
    "up-email-exists-as-username": {};
    "up-blank-attribute-value": Validators.ErrorMessage & {
        "fail-on-null": boolean;
    };
    "up-duplicate-email": {};
    "local-date": Validators.DoIgnoreEmpty;
    pattern: Validators.DoIgnoreEmpty & Validators.ErrorMessage & { pattern: string };
    "person-name-prohibited-characters": Validators.DoIgnoreEmpty & Validators.ErrorMessage;
    uri: Validators.DoIgnoreEmpty;
    "username-prohibited-characters": Validators.DoIgnoreEmpty & Validators.ErrorMessage;
    /** Made up validator that only exists in Keycloakify */
    _compareToOther: Validators.DoIgnoreEmpty &
        Validators.ErrorMessage & {
            name: string;
            shouldBe: "equal" | "different";
        };
    options: Validators.Options;
}>;

export declare namespace Validators {
    export type DoIgnoreEmpty = {
        "ignore.empty.value"?: boolean;
    };

    export type ErrorMessage = {
        "error-message"?: string;
    };

    export type Range = {
        /** "0", "1", "2"... yeah I know, don't tell me */
        min?: `${number}`;
        max?: `${number}`;
    };
    export type Options = {
        options: string[];
    };
}

assert<Equals<KcContextBase["pageId"], LoginThemePageId | AccountThemePageId>>();
