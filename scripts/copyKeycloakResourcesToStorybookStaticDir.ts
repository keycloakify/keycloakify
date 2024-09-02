import { join as pathJoin } from "path";
import { copyKeycloakResourcesToPublic } from "../src/bin/shared/copyKeycloakResourcesToPublic";
import { getProxyFetchOptions } from "../src/bin/tools/fetchProxyOptions";
import { LOGIN_THEME_RESOURCES_FROM_KEYCLOAK_VERSION_DEFAULT } from "../src/bin/shared/constants";

export async function copyKeycloakResourcesToStorybookStaticDir() {
    await copyKeycloakResourcesToPublic({
        buildContext: {
            cacheDirPath: pathJoin(__dirname, "..", "node_modules", ".cache", "scripts"),
            fetchOptions: getProxyFetchOptions({
                npmConfigGetCwd: pathJoin(__dirname, "..")
            }),
            loginThemeResourcesFromKeycloakVersion:
                LOGIN_THEME_RESOURCES_FROM_KEYCLOAK_VERSION_DEFAULT,
            publicDirPath: pathJoin(__dirname, "..", ".storybook", "static")
        }
    });
}
