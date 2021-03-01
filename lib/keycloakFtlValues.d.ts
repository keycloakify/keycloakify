import type { generateFtlFilesCodeFactory } from "../bin/build-keycloak-theme/generateFtl";
import type { AvailableLanguages } from "./i18n/useKeycloakLanguage";
export declare type KeycloakFtlValues = {
    pageBasename: Parameters<ReturnType<typeof generateFtlFilesCodeFactory>["generateFtlFilesCode"]>[0]["pageBasename"];
    url: {
        loginAction: string;
        resourcesPath: string;
        resourcesCommonPath: string;
        loginRestartFlowUrl: string;
    };
    realm: {
        displayName?: string;
        displayNameHtml?: string;
        internationalizationEnabled: boolean;
    };
    /** Undefined if !realm.internationalizationEnabled */
    locale?: {
        supported: {
            languageTag: AvailableLanguages;
        }[];
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
export declare const keycloakPagesContext: KeycloakFtlValues | undefined;
