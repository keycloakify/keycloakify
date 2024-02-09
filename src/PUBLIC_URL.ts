import { nameOfTheGlobal, basenameOfTheKeycloakifyResourcesDir } from "keycloakify/bin/constants";

/**
 * This is an equivalent of process.env.PUBLIC_URL thay you can use in Webpack projects.
 * This works both in your main app and in your Keycloak theme.
 */
export const PUBLIC_URL = (() => {
    const kcContext = (window as any)[nameOfTheGlobal];

    return kcContext === undefined || process.env.NODE_ENV === "development"
        ? process.env.PUBLIC_URL
        : `${kcContext.url.resourcesPath}/${basenameOfTheKeycloakifyResourcesDir}`;
})();
