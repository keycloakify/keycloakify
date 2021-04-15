
import { ftlValuesGlobalName } from "../bin/build-keycloak-theme/ftlValuesGlobalName";
import type { PageId } from "../bin/build-keycloak-theme/generateFtl";
import { id } from "evt/tools/typeSafety/id";
import type { KcLanguageTag } from "./i18n/KcLanguageTag";
import { doExtends } from "evt/tools/typeSafety/doExtends";
import type { MessageKey } from "./i18n/useKcMessage";
import type { LanguageLabel } from "./i18n/KcLanguageTag";

type ExtractAfterStartingWith<Prefix extends string, StrEnum> =
    StrEnum extends `${Prefix}${infer U}` ? U : never;

/** Take theses type definition with a grain of salt. 
 * Some values might be undefined on some pages.
 * (ex: url.loginAction is undefined on error.ftl)
 */
export type KcContext =
    KcContext.Login | KcContext.Register | KcContext.Info |
    KcContext.Error | KcContext.LoginResetPassword | KcContext.LoginVerifyEmail |
    KcContext.Terms;

export declare namespace KcContext {

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
        isAppInitiatedAction: boolean;
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
            rememberMe: boolean;
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

    export type Register = Common & {
        pageId: "register.ftl";
        url: {
            registrationAction: string;
        };
        messagesPerField: {
            printIfExists<T>(
                key:
                    "userLabel" |
                    "username" |
                    "email" |
                    "firstName" |
                    "lastName" |
                    "password" |
                    "password-confirm",
                x: T
            ): T | undefined;
        };
        register: {
            formData: {
                firstName?: string;
                displayName?: string;
                lastName?: string;
                email?: string;
                username?: string;
            }
        };
        passwordRequired: boolean;
        recaptchaRequired: boolean;
        recaptchaSiteKey?: string;
        authorizedMailDomains?: string[];
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
        }
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

}

doExtends<KcContext["pageId"], PageId>();
doExtends<PageId, KcContext["pageId"]>();

export const kcContext = id<KcContext | undefined>((window as any)[ftlValuesGlobalName]);


