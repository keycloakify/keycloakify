


import { ftlValuesGlobalName } from "../bin/build-keycloak-theme/generateKeycloakThemeResources";
import type { generateFtlFilesCodeFactory } from "../bin/build-keycloak-theme/generateFtl";
import { id } from "evt/tools/typeSafety/id";


export type KeycloakFtlValues = {
    pageBasename: Parameters<ReturnType<typeof generateFtlFilesCodeFactory>["generateFtlFilesCode"]>[0]["pageBasename"];
    url: {
        loginAction: string,
        resourcesPath: string
    }
};

export const { keycloakPagesContext } = 
    { [ftlValuesGlobalName]: id<KeycloakFtlValues | undefined>((window as any)[ftlValuesGlobalName]) };
;