import type { BuildContext } from "../../shared/buildContext";
import { assert } from "tsafe/assert";
import {
    generateSrcMainResourcesForMainTheme,
    type BuildContextLike as BuildContextLike_generateSrcMainResourcesForMainTheme
} from "./generateSrcMainResourcesForMainTheme";
import { generateSrcMainResourcesForThemeVariant } from "./generateSrcMainResourcesForThemeVariant";

export type BuildContextLike = BuildContextLike_generateSrcMainResourcesForMainTheme & {
    themeNames: string[];
};

assert<BuildContext extends BuildContextLike ? true : false>();

export async function generateSrcMainResources(params: {
    buildContext: BuildContextLike;
}): Promise<void> {
    const { buildContext } = params;

    const [themeName, ...themeVariantNames] = buildContext.themeNames;

    await generateSrcMainResourcesForMainTheme({
        themeName,
        buildContext
    });

    for (const themeVariantName of themeVariantNames) {
        generateSrcMainResourcesForThemeVariant({
            themeName,
            themeVariantName,
            buildContext
        });
    }
}
