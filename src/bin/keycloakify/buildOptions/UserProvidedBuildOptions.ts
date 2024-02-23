import { z } from "zod";

export type UserProvidedBuildOptions = {
    extraThemeProperties?: string[];
    artifactId?: string;
    groupId?: string;
    doCreateJar?: boolean;
    loginThemeResourcesFromKeycloakVersion?: string;
    reactAppBuildDirPath?: string;
    keycloakifyBuildDirPath?: string;
    themeName?: string | string[];
    doBuildRetrocompatAccountTheme?: boolean;
};

export const zUserProvidedBuildOptions = z.object({
    "extraThemeProperties": z.array(z.string()).optional(),
    "artifactId": z.string().optional(),
    "groupId": z.string().optional(),
    "doCreateJar": z.boolean().optional(),
    "loginThemeResourcesFromKeycloakVersion": z.string().optional(),
    "reactAppBuildDirPath": z.string().optional(),
    "keycloakifyBuildDirPath": z.string().optional(),
    "themeName": z.union([z.string(), z.array(z.string())]).optional(),
    "doBuildRetrocompatAccountTheme": z.boolean().optional()
});
