import { BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR } from "keycloakify/bin/shared/constants";
import { assert } from "tsafe/assert";

/**
 * This is an equivalent of process.env.PUBLIC_URL that you can use in Webpack projects.
 * This works both in your main app and in your Keycloak theme.
 */
export const PUBLIC_URL = (() => {
    const kcContext = (window as any).kcContext;

    if (kcContext === undefined || process.env.NODE_ENV === "development") {
        assert(
            process.env.PUBLIC_URL !== undefined,
            `If you use keycloakify/PUBLIC_URL you should be in Webpack and thus process.env.PUBLIC_URL should be defined`
        );

        return process.env.PUBLIC_URL;
    }

    return `${kcContext.url.resourcesPath}/${BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR}`;
})();
