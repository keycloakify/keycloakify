import type { generateFtlFilesCodeFactory } from "../bin/build-keycloak-theme/generateFtl";
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
