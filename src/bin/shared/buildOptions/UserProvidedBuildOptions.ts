import { z } from "zod";

export type UserProvidedBuildOptions = {
    extraThemeProperties?: string[];
    artifactId?: string;
    groupId?: string;
    loginThemeResourcesFromKeycloakVersion?: string;
    reactAppBuildDirPath?: string;
    keycloakifyBuildDirPath?: string;
    themeName?: string | string[];
};

export const zUserProvidedBuildOptions = z.object({
    "extraThemeProperties": z.array(z.string()).optional(),
    "artifactId": z.string().optional(),
    "groupId": z.string().optional(),
    "loginThemeResourcesFromKeycloakVersion": z.string().optional(),
    "reactAppBuildDirPath": z.string().optional(),
    "keycloakifyBuildDirPath": z.string().optional(),
    "themeName": z.union([z.string(), z.array(z.string())]).optional()
});
