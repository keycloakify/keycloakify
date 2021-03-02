
import { ftlValuesGlobalName } from "../bin/build-keycloak-theme/ftlValuesGlobalName";
import type { generateFtlFilesCodeFactory } from "../bin/build-keycloak-theme/generateFtl";
import { id } from "evt/tools/typeSafety/id";
import type { KcLanguageTag } from "./i18n/KcLanguageTag";


export type KcContext = {
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
            //url: string;
            languageTag: KcLanguageTag;
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
        }[]
    };
    usernameEditDisabled: boolean;
    login: {
        username?: string;
        rememberMe: boolean;
    };
    registrationDisabled: boolean;
};

export const kcContext = id<KcContext | undefined>((window as any)[ftlValuesGlobalName]);
