import type { KcLanguageTag } from "../i18n/KcLanguageTag";
import type { MessageKey } from "../i18n/useKcMessage";
import type { LanguageLabel } from "../i18n/KcLanguageTag";
declare type ExtractAfterStartingWith<Prefix extends string, StrEnum> = StrEnum extends `${Prefix}${infer U}` ? U : never;
/** Take theses type definition with a grain of salt.
 * Some values might be undefined on some pages.
 * (ex: url.loginAction is undefined on error.ftl)
 */
export declare type KcContextBase =
    | KcContextBase.Login
    | KcContextBase.Register
    | KcContextBase.RegisterUserProfile
    | KcContextBase.Info
    | KcContextBase.Error
    | KcContextBase.LoginResetPassword
    | KcContextBase.LoginVerifyEmail
    | KcContextBase.Terms
    | KcContextBase.LoginOtp
    | KcContextBase.LoginUpdateProfile
    | KcContextBase.LoginIdpLinkConfirm
    | KcContextBase.LoginConfigTotp
    | KcContextBase.SamlPostForm;
declare type PolicyTotp = {
    type: "totp";
    period: number;
};
declare type PolicyHotp = {
    type: "hotp";
    initialCounter: number;
};
export declare namespace KcContextBase {
    type Common = {
        url: {
            loginAction: string;
            resourcesPath: string;
            resourcesCommonPath: string;
            loginRestartFlowUrl: string;
            loginUrl: string;
        };
        realm: {
            displayName?: string;
            displayNameHtml?: string;
            internationalizationEnabled: boolean;
            registrationEmailAsUsername: boolean;
        };
        /** Undefined if !realm.internationalizationEnabled */
        locale?: {
            supported: {
                url: string;
                languageTag: KcLanguageTag;
            }[];
            current: LanguageLabel;
        };
        auth?: {
            showUsername: boolean;
            showResetCredentials: boolean;
            showTryAnotherWayLink: boolean;
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
    type Login = Common & {
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
    type RegisterCommon = Common & {
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
    type Register = RegisterCommon & {
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
    type RegisterUserProfile = RegisterCommon & {
        pageId: "register-user-profile.ftl";
        profile: {
            context: "REGISTRATION_PROFILE";
            attributes: Attribute[];
            attributesByName: Record<string, Attribute>;
        };
    };
    type Info = Common & {
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
    type Error = Common & {
        pageId: "error.ftl";
        client?: {
            baseUrl?: string;
        };
        message: NonNullable<Common["message"]>;
    };
    type LoginResetPassword = Common & {
        pageId: "login-reset-password.ftl";
        realm: {
            loginWithEmailAllowed: boolean;
        };
    };
    type LoginVerifyEmail = Common & {
        pageId: "login-verify-email.ftl";
    };
    type Terms = Common & {
        pageId: "terms.ftl";
    };
    type LoginOtp = Common & {
        pageId: "login-otp.ftl";
        otpLogin: {
            userOtpCredentials: {
                id: string;
                userLabel: string;
            }[];
        };
    };
    type LoginUpdateProfile = Common & {
        pageId: "login-update-profile.ftl";
        user: {
            editUsernameAllowed: boolean;
            username?: string;
            email?: string;
            firstName?: string;
            lastName?: string;
        };
    };
    type LoginIdpLinkConfirm = Common & {
        pageId: "login-idp-link-confirm.ftl";
        idpAlias: string;
    };
    type LoginConfigTotp = Common & {
        pageId: "login-config-totp.ftl";
        totp: {
            policy: {
                supportedApplications: string[];
                getAlgorithmKey(): string;
                digits: number;
            } & (PolicyTotp | PolicyHotp);
            totpSecretEncoded: string;
            qrUrl: string;
            manualUrl: string;
            totpSecretQrCode?: string;
            otpCredentials: Record<string, unknown>[];
            totpSecret: string;
        };
        mode?: "manual";
        isAppInitiatedAction: boolean;
    };
    type SamlPostForm = Common & {
        pageId: "saml-post-form.ftl";
        samlPost: {
            url: string;
            SAMLRequest?: string;
            SAMLResponse?: string;
            relayState?: string;
        };
    };
    type Code = Common & {
        pageId: "code.ftl";
    };
    type DeleteAccountConfirm = Common & {
        pageId: "delete-account-confirm.ftl";
    };
    type IdpReviewUserProfile = Common & {
        pageId: "idp-review-user-profile.ftl";
    };
    type LoginConfigTotpText = Common & {
        pageId: "login-config-totp-text.ftl";
    };
    type LoginIdpLinkEmail = Common & {
        pageId: "login-idp-link-email.ftl";
    };
    type LoginOauth2DeviceVerifyUserCode = Common & {
        pageId: "login-oauth2-device-verify-user-code.ftl";
    };
    type LoginOauthGrant = Common & {
        pageId: "login-oauth-grant.ftl";
    };
    type LoginPageExpired = Common & {
        pageId: "login-page-expired.ftl";
    };
    type LoginPassword = Common & {
        pageId: "login-password.ftl";
    };
    type LoginUpdatePassword = Common & {
        pageId: "login-update-password.ftl";
    };
    type LoginUsername = Common & {
        pageId: "login-username.ftl";
    };
    type LoginVerifyEmailCodeText = Common & {
        pageId: "login-verify-email-code-text.ftl";
    };
    type LoginX509Info = Common & {
        pageId: "login-x509-info.ftl";
    };
    type SelectAuthenticator = Common & {
        pageId: "select-authenticator.ftl";
    };
    type UpdateUserProfile = Common & {
        pageId: "update-user-profile.ftl";
    };
    type WebauthnAuthenticate = Common & {
        pageId: "webauthn-authenticate.ftl";
    };
    type WebauthnError = Common & {
        pageId: "webauthn-error.ftl";
    };
    type WebauthnRegister = Common & {
        pageId: "webauthn-register.ftl";
    };
}
export declare type Attribute = {
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
export declare type Validators = Partial<{
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
    pattern: Validators.DoIgnoreEmpty &
        Validators.ErrorMessage & {
            pattern: string;
        };
    "person-name-prohibited-characters": Validators.DoIgnoreEmpty & Validators.ErrorMessage;
    uri: Validators.DoIgnoreEmpty;
    "username-prohibited-characters": Validators.DoIgnoreEmpty & Validators.ErrorMessage;
    /** Made up validator that only exists in Keycloakify */
    _compareToOther: Validators.DoIgnoreEmpty &
        Validators.ErrorMessage & {
            name: string;
            shouldBe: "equal" | "different";
        };
}>;
export declare namespace Validators {
    type DoIgnoreEmpty = {
        "ignore.empty.value"?: boolean;
    };
    type ErrorMessage = {
        "error-message"?: string;
    };
    type Range = {
        /** "0", "1", "2"... yeah I know, don't tell me */
        min?: `${number}`;
        max?: `${number}`;
    };
}
export {};
