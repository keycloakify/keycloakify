
import { ftlValuesGlobalName } from "../bin/build-keycloak-theme/generateKeycloakThemeResources";
import type { generateFtlFilesCodeFactory } from "../bin/build-keycloak-theme/generateFtl";
import { id } from "evt/tools/typeSafety/id";
//import type { LanguageLabel } from "./i18n/getLanguageLabel";
import type { AvailableLanguages } from "./i18n/useKeycloakLanguage";


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
    /** Undefined if !realm.internationalizationEnabled */
    locale?: {
        supported: {
            //url: string;
            languageTag: AvailableLanguages;
            /** Is determined by languageTag. Ex: languageTag === "en" => label === "English"
             * or getLanguageLabel(languageTag) === label
             */
            //label: LanguageLabel;
        }[];
        //NOTE: We do not expose this because the language is managed
        //client side. We use this value however to set the default.
        //current: LanguageLabel;
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