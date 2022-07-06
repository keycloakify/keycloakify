import type { PageId } from "../../bin/build-keycloak-theme/generateFtl";
import type { KcLanguageTag } from "../i18n";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import type { MessageKey } from "../i18n";

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
    | KcContextBase.LoginUpdatePassword
    | KcContextBase.LoginUpdateProfile
    | KcContextBase.LoginIdpLinkConfirm
    | KcContextBase.LoginIdpLinkEmail
    | KcContextBase.LoginPageExpired
    | KcContextBase.LoginConfigTotp;

export declare namespace KcContextBase {
    export type Common = {
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
                languageTag: KcLanguageTag;
            }[];
            currentLanguageTag: KcLanguageTag;
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

    export type Login = Common & {
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

    export type RegisterCommon = Common & {
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

    export type Register = RegisterCommon & {
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

    export type RegisterUserProfile = RegisterCommon & {
        pageId: "register-user-profile.ftl";
        profile: {
            context: "REGISTRATION_PROFILE";
            attributes: Attribute[];
            attributesByName: Record<string, Attribute>;
        };
    };

    export type Info = Common & {
        pageId: "info.ftl";
        messageHeader?: string;
        requiredActions?: ExtractAfterStartingWith<"requiredAction.", MessageKey>[];
        skipLink: boolean;
        pageRedirectUri?: string;
        actionUri?: string;
        client: {
            baseUrl?: string;
        };
    };

    export type Error = Common & {
        pageId: "error.ftl";
        client?: {
            baseUrl?: string;
        };
        message: NonNullable<Common["message"]>;
    };

    export type LoginResetPassword = Common & {
        pageId: "login-reset-password.ftl";
        realm: {
            loginWithEmailAllowed: boolean;
        };
    };

    export type LoginVerifyEmail = Common & {
        pageId: "login-verify-email.ftl";
        //NOTE: Optional because maybe it wasn't defined in older keycloak versions.
        user?: {
            email: string;
        };
    };

    export type Terms = Common & {
        pageId: "terms.ftl";
    };

    export type LoginOtp = Common & {
        pageId: "login-otp.ftl";
        otpLogin: {
            userOtpCredentials: { id: string; userLabel: string }[];
        };
    };

    export type LoginUpdatePassword = Common & {
        pageId: "login-update-password.ftl";
        username: string;
    };

    export type LoginUpdateProfile = Common & {
        pageId: "login-update-profile.ftl";
        user: {
            editUsernameAllowed: boolean;
            username?: string;
            email?: string;
            firstName?: string;
            lastName?: string;
        };
    };

    export type LoginIdpLinkConfirm = Common & {
        pageId: "login-idp-link-confirm.ftl";
        idpAlias: string;
    };

    export type LoginIdpLinkEmail = Common & {
        pageId: "login-idp-link-email.ftl";
        brokerContext: {
            username: string;
        };
        idpAlias: string;
    };

    export type LoginPageExpired = Common & {
        pageId: "login-page-expired.ftl";
    };

    export type LoginConfigTotp = Common & {
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

assert<Equals<KcContextBase["pageId"], PageId>>();
