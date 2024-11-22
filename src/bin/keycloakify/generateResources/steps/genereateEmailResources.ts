import { join as pathJoin } from "path";
import { transformCodebase } from "../../../tools/transformCodebase";
import { extractThemeVariantFromProperties } from "../extractThemeVariantFromProperties";
import { getThemeTypeDirPath } from "../getThemeTypeDirPath";

export function generateEmailResources(params: {
    themeSrcDirPath: string;
    resourcesDirPath: string;
    themeNames: string[];
}) {
    const { themeSrcDirPath, resourcesDirPath, themeNames } = params;
    const emailThemeSrcDirPath = pathJoin(themeSrcDirPath, "email");

    for (const themeName of themeNames) {
        const emailThemeDirPath = getThemeTypeDirPath({
            resourcesDirPath,
            themeName,
            themeType: "email"
        });

        transformCodebase({
            srcDirPath: emailThemeSrcDirPath,
            destDirPath: emailThemeDirPath,
            transformSourceCode: ({ filePath, sourceCode }) => {
                if (filePath.endsWith(".properties")) {
                    return {
                        modifiedSourceCode: Buffer.from(
                            extractThemeVariantFromProperties(
                                sourceCode.toString("utf8"),
                                themeName,
                                themeNames
                            ),
                            "utf8"
                        )
                    };
                }

                if (!filePath.endsWith(".ftl")) {
                    return { modifiedSourceCode: sourceCode };
                }

                return {
                    modifiedSourceCode: Buffer.from(
                        sourceCode
                            .toString("utf8")
                            .replace(/xKeycloakify\.themeName/g, `"${themeName}"`),
                        "utf8"
                    )
                };
            }
        });
    }
}
