import type { KeycloakVersionRange } from "./KeycloakVersionRange";

export function getJarFileBasename(params: { keycloakVersionRange: KeycloakVersionRange }) {
    const { keycloakVersionRange } = params;

    const jarFileBasename = `keycloak-theme-for-kc-${keycloakVersionRange}.jar`;

    return { jarFileBasename };
}
