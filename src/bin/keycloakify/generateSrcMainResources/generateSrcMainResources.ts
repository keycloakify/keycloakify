import type { BuildOptions } from "../../shared/buildOptions";
import { assert } from "tsafe/assert";
import {
    generateSrcMainResourcesForMainTheme,
    type BuildOptionsLike as BuildOptionsLike_generateSrcMainResourcesForMainTheme
} from "./generateSrcMainResourcesForMainTheme";
import { generateSrcMainResourcesForThemeVariant } from "./generateSrcMainResourcesForThemeVariant";

export type BuildOptionsLike = BuildOptionsLike_generateSrcMainResourcesForMainTheme & {
    themeNames: string[];
};

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export async function generateSrcMainResources(params: { buildOptions: BuildOptionsLike }): Promise<void> {
    const { buildOptions } = params;

    const [themeName, ...themeVariantNames] = buildOptions.themeNames;

    await generateSrcMainResourcesForMainTheme({
        themeName,
        buildOptions
    });

    for (const themeVariantName of themeVariantNames) {
        generateSrcMainResourcesForThemeVariant({
            themeName,
            themeVariantName,
            buildOptions
        });
    }
}
