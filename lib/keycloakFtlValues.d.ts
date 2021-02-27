import type { generateFtlFilesCodeFactory } from "../bin/build-keycloak-theme/generateFtl";
export declare type LanguageLabel = "Deutsch" | "Norsk" | "Русский" | "Svenska" | "Português (Brasil)" | "Lietuvių" | "English" | "Italiano" | "Français" | "中文简体" | "Español" | "Čeština" | "日本語" | "Slovenčina" | "Polish" | "Català" | "Nederlands" | "tr";
export declare type LanguageTag = "de" | "no" | "ru" | "sv" | "pt-BR" | "lt" | "en" | "it" | "fr" | "zh-CN" | "es" | "cs" | "ja" | "sk" | "pl" | "ca" | "nl" | "tr";
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
    locale?: {
        supported: {
            url: string;
            label: LanguageLabel;
            languageTag: LanguageTag;
        };
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
export declare const keycloakPagesContext: KeycloakFtlValues | undefined;
