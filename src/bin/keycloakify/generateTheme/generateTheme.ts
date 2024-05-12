import { join as pathJoin } from "path";
import type { BuildOptions } from "../buildOptions";
import { assert } from "tsafe/assert";
import { generateSrcMainResources, type BuildOptionsLike as BuildOptionsLike_generateSrcMainResources } from "./generateSrcMainResources";
import { generateThemeVariations } from "./generateThemeVariants";

export type BuildOptionsLike = BuildOptionsLike_generateSrcMainResources & {
    keycloakifyBuildDirPath: string;
    themeNames: string[];
};

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export async function generateTheme(params: {
    themeSrcDirPath: string;
    keycloakifySrcDirPath: string;
    buildOptions: BuildOptionsLike;
    keycloakifyVersion: string;
}): Promise<{ doesImplementAccountTheme: boolean }> {
    const { themeSrcDirPath, keycloakifySrcDirPath, buildOptions, keycloakifyVersion } = params;

    const [themeName, ...themeVariantNames] = buildOptions.themeNames;

    const srcMainResourcesDirPath = pathJoin(buildOptions.keycloakifyBuildDirPath, "src", "main", "resources");

    const { doesImplementAccountTheme } = await generateSrcMainResources({
        themeName,
        srcMainResourcesDirPath,
        themeSrcDirPath,
        keycloakifySrcDirPath,
        keycloakifyVersion,
        buildOptions
    });

    for (const themeVariantName of themeVariantNames) {
        generateThemeVariations({
            themeName,
            themeVariantName,
            srcMainResourcesDirPath
        });
    }

    return { doesImplementAccountTheme };
}
