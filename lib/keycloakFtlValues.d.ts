import type { generateFtlFilesCodeFactory } from "../bin/build-keycloak-theme/generateFtl";
export declare type KeycloakFtlValues = {
    pageBasename: Parameters<ReturnType<typeof generateFtlFilesCodeFactory>["generateFtlFilesCode"]>[0]["pageBasename"];
    url: {
        loginAction: string;
        resourcesPath: string;
    };
};
export declare const keycloakPagesContext: KeycloakFtlValues | undefined;
