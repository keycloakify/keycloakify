import { type ThemeType } from "../../constants";
import { join as pathJoin } from "path";
import type { BuildOptions } from "../buildOptions";
import { assert } from "tsafe/assert";
import { generateSrcMainResources } from "./generateSrcMainResources";
import { generateThemeVariations } from "./generateThemeVariants";

export type BuildOptionsLike = {
    bundler: "vite" | "webpack";
    themeNames: string[];
    extraThemeProperties: string[] | undefined;
    themeVersion: string;
    loginThemeResourcesFromKeycloakVersion: string;
    keycloakifyBuildDirPath: string;
    reactAppBuildDirPath: string;
    cacheDirPath: string;
    assetsDirPath: string;
    urlPathname: string | undefined;
    npmWorkspaceRootDirPath: string;
};

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export async function generateTheme(params: {
    themeSrcDirPath: string;
    keycloakifySrcDirPath: string;
    buildOptions: BuildOptionsLike;
    keycloakifyVersion: string;
}): Promise<{ implementedThemeTypes: Record<ThemeType | "email", boolean> }> {
    const { themeSrcDirPath, keycloakifySrcDirPath, buildOptions, keycloakifyVersion } = params;

    const [themeName, ...themeVariantNames] = buildOptions.themeNames;

    const { implementedThemeTypes } = await generateSrcMainResources({
        themeName,
        "srcMainResourcesDirPath": pathJoin(buildOptions.keycloakifyBuildDirPath, "src", "main", "resources"),
        themeSrcDirPath,
        keycloakifySrcDirPath,
        keycloakifyVersion,
        buildOptions
    });

    for (const themeVariantName of themeVariantNames) {
        generateThemeVariations({
            themeName,
            themeVariantName,
            implementedThemeTypes,
            buildOptions
        });
    }

    return { implementedThemeTypes };
}
