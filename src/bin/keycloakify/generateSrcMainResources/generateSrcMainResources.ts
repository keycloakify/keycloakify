import type { BuildContext } from "../../shared/buildContext";
import { assert } from "tsafe/assert";
import {
    generateSrcMainResourcesForMainTheme,
    type BuildContextLike as BuildContextLike_generateSrcMainResourcesForMainTheme
} from "./generateSrcMainResourcesForMainTheme";
import { generateSrcMainResourcesForThemeVariant } from "./generateSrcMainResourcesForThemeVariant";
import fs from "fs";
import { rmSync } from "../../tools/fs.rmSync";

export type BuildContextLike = BuildContextLike_generateSrcMainResourcesForMainTheme & {
    themeNames: string[];
};

assert<BuildContext extends BuildContextLike ? true : false>();

export async function generateSrcMainResources(params: {
    buildContext: BuildContextLike;
    resourcesDirPath: string;
}): Promise<void> {
    const { resourcesDirPath, buildContext } = params;

    const [themeName, ...themeVariantNames] = buildContext.themeNames;

    if (fs.existsSync(resourcesDirPath)) {
        rmSync(resourcesDirPath, { recursive: true });
    }

    await generateSrcMainResourcesForMainTheme({
        resourcesDirPath,
        themeName,
        buildContext
    });

    for (const themeVariantName of themeVariantNames) {
        generateSrcMainResourcesForThemeVariant({
            resourcesDirPath,
            themeName,
            themeVariantName
        });
    }
}
