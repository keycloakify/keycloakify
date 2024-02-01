export const keycloak_resources = "keycloak-resources";
export const resources_common = "resources-common";
export const lastKeycloakVersionWithAccountV1 = "21.1.2";

export const themeTypes = ["login", "account"] as const;
export const retrocompatPostfix = "_retrocompat";
export const accountV1 = "account-v1";

export type ThemeType = (typeof themeTypes)[number];
