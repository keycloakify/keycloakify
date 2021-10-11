export const keycloakVersions = ["11.0.3", "15.0.2"] as const;

export type KeycloakVersion = typeof keycloakVersions[number];
