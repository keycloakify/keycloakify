import { join as pathJoin, extname as pathExtname, sep as pathSep } from "path";
import { transformCodebase } from "../../tools/transformCodebase";
import type { BuildContext } from "../../shared/buildContext";
import {
    readMetaInfKeycloakThemes_fromResourcesDirPath,
    writeMetaInfKeycloakThemes
} from "../../shared/metaInfKeycloakThemes";
import { assert } from "tsafe/assert";

export type BuildContextLike = {
    keycloakifyBuildDirPath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export function generateResourcesForThemeVariant(params: {
    resourcesDirPath: string;
    themeName: string;
    themeVariantName: string;
}) {
    const { resourcesDirPath, themeName, themeVariantName } = params;

    const mainThemeDirPath = pathJoin(resourcesDirPath, "theme", themeName);

    transformCodebase({
        srcDirPath: mainThemeDirPath,
        destDirPath: pathJoin(mainThemeDirPath, "..", themeVariantName),
        transformSourceCode: ({ fileRelativePath, sourceCode }) => {
            if (
                pathExtname(fileRelativePath) === ".ftl" &&
                fileRelativePath.split(pathSep).length === 2
            ) {
                const modifiedSourceCode = Buffer.from(
                    Buffer.from(sourceCode)
                        .toString("utf-8")
                        .replace(
                            `out["themeName"] = "${themeName}";`,
                            `out["themeName"] = "${themeVariantName}";`
                        ),
                    "utf8"
                );

                assert(Buffer.compare(modifiedSourceCode, sourceCode) !== 0);

                return { modifiedSourceCode };
            }

            return { modifiedSourceCode: sourceCode };
        }
    });

    {
        const updatedMetaInfKeycloakThemes =
            readMetaInfKeycloakThemes_fromResourcesDirPath({
                resourcesDirPath
            });

        updatedMetaInfKeycloakThemes.themes.push({
            name: themeVariantName,
            types: (() => {
                const theme = updatedMetaInfKeycloakThemes.themes.find(
                    ({ name }) => name === themeName
                );
                assert(theme !== undefined);
                return theme.types;
            })()
        });

        writeMetaInfKeycloakThemes({
            resourcesDirPath,
            metaInfKeycloakThemes: updatedMetaInfKeycloakThemes
        });
    }
}
