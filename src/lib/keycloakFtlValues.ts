


import { ftlValuesGlobalName } from "../bin/build-keycloak-theme/generateKeycloakThemeResources";
import type { generateFtlFilesCodeFactory } from "../bin/build-keycloak-theme/generateFtl";
import { id } from "evt/tools/typeSafety/id";


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
    //We hide this since we provide a client side internationalization engine
    /*
    locale?: {
        supported: {
            url: string;
            languageTag: AvailableLanguages;
            //NOTE: Is determined by languageTag. Ex: languageTag === "en" => label === "English"
            label: LanguageLabel;
        },
        current: LanguageLabel;
    },
    */
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