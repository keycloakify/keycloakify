import type { KcLanguageTag } from "./i18n/KcLanguageTag";
import type { MessageKey } from "./i18n/useKcTranslation";
import type { LanguageLabel } from "./i18n/KcLanguageTag";
declare type ExtractAfterStartingWith<Prefix extends string, StrEnum> = StrEnum extends `${Prefix}${infer U}` ? U : never;
export declare type KcContext = KcContext.Login | KcContext.Register | KcContext.Info | KcContext.Error;
export declare namespace KcContext {
    type Template = {
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
            attemptedUsername?: boolean;
        };
        scripts: string[];
        message?: {
            type: "success" | "warning" | "error" | "info";
            summary: string;
        };
        isAppInitiatedAction: boolean;
    };
    type Login = Template & {
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
            }[];
        };
    };
    type Register = Template & {
        pageId: "register.ftl";
        url: {
            registrationAction: string;
        };
        messagesPerField: {
            printIfExists<T>(key: "userLabel" | "username" | "email" | "firstName" | "lastName" | "password" | "password-confirm", x: T): T | undefined;
        };
        register: {
            formData: {
                firstName?: string;
                displayName?: string;
                lastName?: string;
                email?: string;
                username?: string;
            };
        };
        passwordRequired: boolean;
        recaptchaRequired: boolean;
        /** undefined if !recaptchaRequired */
        recaptchaSiteKey?: string;
    };
    type Info = Template & {
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
    type Error = Template & {
        pageId: "error.ftl";
        client?: {
            baseUrl?: string;
        };
    };
}
export declare const kcContext: KcContext | undefined;
export {};
