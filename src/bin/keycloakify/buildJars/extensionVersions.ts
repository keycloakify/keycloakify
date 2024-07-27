// NOTE: v0.5 is a dummy version.
export const keycloakAccountV1Versions = [null, "0.3", "0.4", "0.6"] as const;

/**
 * https://central.sonatype.com/artifact/io.phasetwo.keycloak/keycloak-account-v1
 * https://github.com/p2-inc/keycloak-account-v1
 */
export type KeycloakAccountV1Version = (typeof keycloakAccountV1Versions)[number];

export const keycloakThemeAdditionalInfoExtensionVersions = [null, "1.1.5"] as const;

/**
 * https://central.sonatype.com/artifact/dev.jcputney/keycloak-theme-additional-info-extension
 * https://github.com/jcputney/keycloak-theme-additional-info-extension
 * */
export type KeycloakThemeAdditionalInfoExtensionVersion =
    (typeof keycloakThemeAdditionalInfoExtensionVersions)[number];
