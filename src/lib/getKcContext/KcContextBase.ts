
import type { PageId } from "../../bin/build-keycloak-theme/generateFtl";
import type { KcLanguageTag } from "../i18n/KcLanguageTag";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import type { MessageKey } from "../i18n/useKcMessage";
import type { LanguageLabel } from "../i18n/KcLanguageTag";

type ExtractAfterStartingWith<Prefix extends string, StrEnum> =
    StrEnum extends `${Prefix}${infer U}` ? U : never;

/** Take theses type definition with a grain of salt. 
 * Some values might be undefined on some pages.
 * (ex: url.loginAction is undefined on error.ftl)
 */
export type KcContextBase =
    KcContextBase.Login | KcContextBase.Register | KcContextBase.RegisterUserProfile | KcContextBase.Info |
    KcContextBase.Error | KcContextBase.LoginResetPassword | KcContextBase.LoginVerifyEmail |
    KcContextBase.Terms | KcContextBase.LoginOtp | KcContextBase.LoginUpdateProfile |
    KcContextBase.LoginIdpLinkConfirm;

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
                /** Is determined by languageTag. Ex: languageTag === "en" => label === "English"
                 * or getLanguageLabel(languageTag) === label
                 */
                //label: LanguageLabel;
            }[];
            current: LanguageLabel;
        },
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
        }
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
            }[]
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
            }[]
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
            }
        };
    };

    export type RegisterUserProfile = RegisterCommon & {
        pageId: "register-user-profile.ftl";
        profile: {
            attributes: {
                name: string;
                displayName?: string;
                required: boolean;
                value?: string;
                group?: string;
                groupDisplayHeader?: string;
                groupDisplayDescription?: string;
                readOnly: boolean;
                autocomplete?: string;
            }[];
        }
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
        }
    };

    export type Error = Common & {
        pageId: "error.ftl";
        client?: {
            baseUrl?: string;
        },
        message: NonNullable<Common["message"]>;
    };

    export type LoginResetPassword = Common & {
        pageId: "login-reset-password.ftl";
        realm: {
            loginWithEmailAllowed: boolean;
        }
    };

    export type LoginVerifyEmail = Common & {
        pageId: "login-verify-email.ftl";
    };

    export type Terms = Common & {
        pageId: "terms.ftl";
    };

    export type LoginOtp = Common & {
        pageId: "login-otp.ftl";
        otpLogin: {
            userOtpCredentials: { id: string; userLabel: string; }[];
        }
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

}

assert<Equals<KcContextBase["pageId"], PageId>>();



