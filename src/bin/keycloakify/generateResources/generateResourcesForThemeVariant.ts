import { join as pathJoin, extname as pathExtname, sep as pathSep } from "path";
import { transformCodebase } from "../../tools/transformCodebase";
import { writeMetaInfKeycloakThemes } from "../../shared/metaInfKeycloakThemes";
import { assert } from "tsafe/assert";
import type { ThemeType } from "../../shared/constants";

export function generateResourcesForThemeVariant(params: {
    resourcesDirPath: string;
    themeName: string;
    themeVariantName: string;
    writeMessagePropertiesFiles: (params: {
        getMessageDirPath: (params: { themeType: ThemeType }) => string;
        themeName: string;
    }) => void;
}) {
    const { resourcesDirPath, themeName, themeVariantName, writeMessagePropertiesFiles } =
        params;

    const mainThemeDirPath = pathJoin(resourcesDirPath, "theme", themeName);
    const themeVariantDirPath = pathJoin(mainThemeDirPath, "..", themeVariantName);

    transformCodebase({
        srcDirPath: mainThemeDirPath,
        destDirPath: themeVariantDirPath,
        transformSourceCode: ({ fileRelativePath, sourceCode }) => {
            if (
                pathExtname(fileRelativePath) === ".ftl" &&
                fileRelativePath.split(pathSep).length === 2
            ) {
                const modifiedSourceCode = Buffer.from(
                    Buffer.from(sourceCode)
                        .toString("utf-8")
                        .replace(
                            `"themeName": "${themeName}"`,
                            `"themeName": "${themeVariantName}"`
                        ),
                    "utf8"
                );

                assert(Buffer.compare(modifiedSourceCode, sourceCode) !== 0);

                return { modifiedSourceCode };
            }

            return { modifiedSourceCode: sourceCode };
        }
    });

    writeMetaInfKeycloakThemes({
        resourcesDirPath,
        getNewMetaInfKeycloakTheme: ({ metaInfKeycloakTheme }) => {
            assert(metaInfKeycloakTheme !== undefined);

            const newMetaInfKeycloakTheme = metaInfKeycloakTheme;

            newMetaInfKeycloakTheme.themes.push({
                name: themeVariantName,
                types: (() => {
                    const theme = newMetaInfKeycloakTheme.themes.find(
                        ({ name }) => name === themeName
                    );
                    assert(theme !== undefined);
                    return theme.types;
                })()
            });

            return newMetaInfKeycloakTheme;
        }
    });

    writeMessagePropertiesFiles({
        getMessageDirPath: ({ themeType }) =>
            pathJoin(themeVariantDirPath, themeType, "messages"),
        themeName: themeVariantName
    });
}
