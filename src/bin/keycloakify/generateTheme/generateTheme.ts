import type { BuildOptions } from "../../shared/buildOptions";
import { assert } from "tsafe/assert";
import { generateSrcMainResources, type BuildOptionsLike as BuildOptionsLike_generateSrcMainResources } from "./generateSrcMainResources";
import { generateThemeVariations } from "./generateThemeVariants";

export type BuildOptionsLike = BuildOptionsLike_generateSrcMainResources & {
    keycloakifyBuildDirPath: string;
    themeNames: string[];
};

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export async function generateTheme(params: { buildOptions: BuildOptionsLike }): Promise<void> {
    const { buildOptions } = params;

    const [themeName, ...themeVariantNames] = buildOptions.themeNames;

    await generateSrcMainResources({
        themeName,
        buildOptions
    });

    for (const themeVariantName of themeVariantNames) {
        generateThemeVariations({
            themeName,
            themeVariantName,
            buildOptions
        });
    }
}
