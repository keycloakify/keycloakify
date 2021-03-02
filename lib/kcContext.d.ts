import type { generateFtlFilesCodeFactory } from "../bin/build-keycloak-theme/generateFtl";
import type { KcLanguageTag } from "./i18n/KcLanguageTag";
export declare type KcContext = {
    pageBasename: Parameters<ReturnType<typeof generateFtlFilesCodeFactory>["generateFtlFilesCode"]>[0]["pageBasename"];
    url: {
        loginAction: string;
        resourcesPath: string;
        resourcesCommonPath: string;
        loginRestartFlowUrl: string;
        loginResetCredentialsUrl: string;
        registrationUrl: string;
    };
    realm: {
        displayName?: string;
        displayNameHtml?: string;
        internationalizationEnabled: boolean;
        password: boolean;
        loginWithEmailAllowed: boolean;
        registrationEmailAsUsername: boolean;
        rememberMe: boolean;
        resetPasswordAllowed: boolean;
    };
    /** Undefined if !realm.internationalizationEnabled */
    locale?: {
        supported: {
            languageTag: KcLanguageTag;
        }[];
    };
    auth?: {
        showUsername: boolean;
        showResetCredentials: boolean;
        showTryAnotherWayLink: boolean;
        attemptedUsername?: boolean;
        selectedCredential?: string;
    };
    scripts: string[];
    message?: {
        type: "success" | "warning" | "error" | "info";
        summary: string;
    };
    isAppInitiatedAction: boolean;
    social: {
        displayInfo: boolean;
        providers?: {
            loginUrl: string;
            alias: string;
            providerId: string;
            displayName: string;
        }[];
    };
    usernameEditDisabled: boolean;
    login: {
        username?: string;
        rememberMe: boolean;
    };
    registrationDisabled: boolean;
};
export declare const kcContext: KcContext | undefined;
