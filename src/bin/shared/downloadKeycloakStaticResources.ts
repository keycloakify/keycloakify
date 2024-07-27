import { transformCodebase } from "../tools/transformCodebase";
import { join as pathJoin } from "path";
import {
    downloadKeycloakDefaultTheme,
    type BuildContextLike as BuildContextLike_downloadKeycloakDefaultTheme
} from "./downloadKeycloakDefaultTheme";
import { RESOURCES_COMMON, type ThemeType } from "./constants";
import type { BuildContext } from "./buildContext";
import { assert } from "tsafe/assert";
import { existsAsync } from "../tools/fs.existsAsync";

export type BuildContextLike = BuildContextLike_downloadKeycloakDefaultTheme & {};

assert<BuildContext extends BuildContextLike ? true : false>();

export async function downloadKeycloakStaticResources(params: {
    themeType: ThemeType;
    themeDirPath: string;
    keycloakVersion: string;
    buildContext: BuildContextLike;
}) {
    const { themeType, themeDirPath, keycloakVersion, buildContext } = params;

    const { defaultThemeDirPath } = await downloadKeycloakDefaultTheme({
        keycloakVersion,
        buildContext
    });

    const resourcesDirPath = pathJoin(themeDirPath, themeType, "resources");

    repatriate_base_resources: {
        const srcDirPath = pathJoin(defaultThemeDirPath, "base", themeType, "resources");

        if (!(await existsAsync(srcDirPath))) {
            break repatriate_base_resources;
        }

        transformCodebase({
            srcDirPath,
            destDirPath: resourcesDirPath
        });
    }

    transformCodebase({
        srcDirPath: pathJoin(defaultThemeDirPath, "keycloak", themeType, "resources"),
        destDirPath: resourcesDirPath
    });

    transformCodebase({
        srcDirPath: pathJoin(defaultThemeDirPath, "keycloak", "common", "resources"),
        destDirPath: pathJoin(resourcesDirPath, RESOURCES_COMMON)
    });
}
