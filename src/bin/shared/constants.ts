export const nameOfTheGlobal = "kcContext";
export const keycloak_resources = "keycloak-resources";
export const resources_common = "resources-common";
export const lastKeycloakVersionWithAccountV1 = "21.1.2";
export const basenameOfTheKeycloakifyResourcesDir = "build";

export const themeTypes = ["login", "account"] as const;
export const accountV1ThemeName = "account-v1";

export type ThemeType = (typeof themeTypes)[number];

export const vitePluginSubScriptEnvNames = {
    "runPostBuildScript": "KEYCLOAKIFY_RUN_POST_BUILD_SCRIPT",
    "resolveViteConfig": "KEYCLOAKIFY_RESOLVE_VITE_CONFIG"
} as const;
