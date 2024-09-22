import type { BuildContext } from "../../shared/buildContext";
import { assert } from "tsafe/assert";
import {
    generateResourcesForMainTheme,
    type BuildContextLike as BuildContextLike_generateResourcesForMainTheme
} from "./generateResourcesForMainTheme";
import { generateResourcesForThemeVariant } from "./generateResourcesForThemeVariant";
import fs from "fs";
import { rmSync } from "../../tools/fs.rmSync";

export type BuildContextLike = BuildContextLike_generateResourcesForMainTheme & {
    themeNames: string[];
};

assert<BuildContext extends BuildContextLike ? true : false>();

export async function generateResources(params: {
    buildContext: BuildContextLike;
    resourcesDirPath: string;
}): Promise<void> {
    const { resourcesDirPath, buildContext } = params;

    const [themeName, ...themeVariantNames] = buildContext.themeNames;

    if (fs.existsSync(resourcesDirPath)) {
        rmSync(resourcesDirPath, { recursive: true });
    }

    const { writeMessagePropertiesFilesForThemeVariant } =
        await generateResourcesForMainTheme({
            resourcesDirPath,
            themeName,
            buildContext
        });

    for (const themeVariantName of themeVariantNames) {
        generateResourcesForThemeVariant({
            resourcesDirPath,
            themeName,
            themeVariantName,
            writeMessagePropertiesFiles: writeMessagePropertiesFilesForThemeVariant
        });
    }
}
