import { transformCodebase } from "../tools/transformCodebase";
import { join as pathJoin } from "path";
import {
    downloadKeycloakDefaultTheme,
    type BuildOptionsLike as BuildOptionsLike_downloadKeycloakDefaultTheme
} from "./downloadKeycloakDefaultTheme";
import { resources_common, type ThemeType } from "./constants";
import type { BuildOptions } from "./buildOptions";
import { assert } from "tsafe/assert";
import { existsAsync } from "../tools/fs.existsAsync";

export type BuildOptionsLike = BuildOptionsLike_downloadKeycloakDefaultTheme & {};

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export async function downloadKeycloakStaticResources(params: {
    themeType: ThemeType;
    themeDirPath: string;
    keycloakVersion: string;
    buildOptions: BuildOptionsLike;
}) {
    const { themeType, themeDirPath, keycloakVersion, buildOptions } = params;

    const { defaultThemeDirPath } = await downloadKeycloakDefaultTheme({
        keycloakVersion,
        buildOptions
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
        destDirPath: pathJoin(resourcesDirPath, resources_common)
    });
}
