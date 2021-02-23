


import { ftlValuesGlobalName } from "../bin/build-keycloak-theme/generateKeycloakThemeResources";
import type { generateFtlFilesCodeFactory } from "../bin/build-keycloak-theme/generateFtl";
import { id } from "evt/tools/typeSafety/id";

export type LanguageLabel =
    /* spell-checker: disable */
    "Deutsch" | "Norsk" | "Русский" | "Svenska" | "Português (Brasil)" | "Lietuvių" |
    "English" | "Italiano" | "Français" | "中文简体" | "Español" | "Čeština" | "日本語" |
    "Slovenčina" | "Polish" | "Català" | "Nederlands" | "tr";
/* spell-checker: enable */

export type LanguageTag = "de" | "no" | "ru" | "sv" | "pt-BR" | "lt" | "en" | "it" | "fr" | "zh-CN" | "es" | "cs" | "ja" | "sk" | "pl" | "ca" | "nl" | "tr";

export type KeycloakFtlValues = {
    pageBasename: Parameters<ReturnType<typeof generateFtlFilesCodeFactory>["generateFtlFilesCode"]>[0]["pageBasename"];
    url: {
        loginAction: string;
        resourcesPath: string;
        resourcesCommonPath: string;
        loginRestartFlowUrl: string;
    },
    realm: {
        displayName?: string;
        displayNameHtml?: string;
        internationalizationEnabled: boolean;
    },
    //NOTE: Undefined if !realm.internationalizationEnabled
    locale?: {
        supported: {
            url: string;
            label: LanguageLabel;
            languageTag: LanguageTag;
        },
        current: LanguageLabel;
    },
    auth?: {
        showUsername: boolean;
        showResetCredentials: boolean;
        showTryAnotherWayLink: boolean;
        attemptedUsername?: boolean;
    },
    scripts: string[];
    message?: {
        type: "success" | "warning" | "error" | "info";
        summary: string;
    },
    isAppInitiatedAction: boolean;
};

export const { keycloakPagesContext } =
    { [ftlValuesGlobalName]: id<KeycloakFtlValues | undefined>((window as any)[ftlValuesGlobalName]) };
;