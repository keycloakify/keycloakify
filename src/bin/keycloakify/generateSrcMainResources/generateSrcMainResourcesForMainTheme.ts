import { transformCodebase } from "../../tools/transformCodebase";
import * as fs from "fs";
import { join as pathJoin, resolve as pathResolve } from "path";
import { replaceImportsInJsCode } from "../replacers/replaceImportsInJsCode";
import { replaceImportsInCssCode } from "../replacers/replaceImportsInCssCode";
import {
    generateFtlFilesCodeFactory,
    type BuildOptionsLike as BuildOptionsLike_kcContextExclusionsFtlCode
} from "../generateFtl";
import {
    type ThemeType,
    lastKeycloakVersionWithAccountV1,
    keycloak_resources,
    accountV1ThemeName,
    basenameOfTheKeycloakifyResourcesDir,
    loginThemePageIds,
    accountThemePageIds
} from "../../shared/constants";
import { isInside } from "../../tools/isInside";
import type { BuildOptions } from "../../shared/buildOptions";
import { assert, type Equals } from "tsafe/assert";
import {
    downloadKeycloakStaticResources,
    type BuildOptionsLike as BuildOptionsLike_downloadKeycloakStaticResources
} from "../../shared/downloadKeycloakStaticResources";
import { readFieldNameUsage } from "./readFieldNameUsage";
import { readExtraPagesNames } from "./readExtraPageNames";
import { generateMessageProperties } from "./generateMessageProperties";
import {
    bringInAccountV1,
    type BuildOptionsLike as BuildOptionsLike_bringInAccountV1
} from "./bringInAccountV1";
import { getThemeSrcDirPath } from "../../shared/getThemeSrcDirPath";
import { rmSync } from "../../tools/fs.rmSync";
import { readThisNpmPackageVersion } from "../../tools/readThisNpmPackageVersion";
import {
    writeMetaInfKeycloakThemes,
    type MetaInfKeycloakTheme
} from "../../shared/metaInfKeycloakThemes";
import { objectEntries } from "tsafe/objectEntries";
import { escapeStringForPropertiesFile } from "../../tools/escapeStringForPropertiesFile";

export type BuildOptionsLike = BuildOptionsLike_kcContextExclusionsFtlCode &
    BuildOptionsLike_downloadKeycloakStaticResources &
    BuildOptionsLike_bringInAccountV1 & {
        bundler: "vite" | "webpack";
        extraThemeProperties: string[] | undefined;
        loginThemeResourcesFromKeycloakVersion: string;
        projectBuildDirPath: string;
        assetsDirPath: string;
        urlPathname: string | undefined;
        projectDirPath: string;
        keycloakifyBuildDirPath: string;
        environmentVariables: { name: string; default: string }[];
    };

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export async function generateSrcMainResourcesForMainTheme(params: {
    themeName: string;
    buildOptions: BuildOptionsLike;
}): Promise<void> {
    const { themeName, buildOptions } = params;

    const { themeSrcDirPath } = getThemeSrcDirPath({
        projectDirPath: buildOptions.projectDirPath
    });

    const getThemeTypeDirPath = (params: { themeType: ThemeType | "email" }) => {
        const { themeType } = params;
        return pathJoin(
            buildOptions.keycloakifyBuildDirPath,
            "src",
            "main",
            "resources",
            "theme",
            themeName,
            themeType
        );
    };

    const cssGlobalsToDefine: Record<string, string> = {};

    const implementedThemeTypes: Record<ThemeType | "email", boolean> = {
        login: false,
        account: false,
        email: false
    };

    for (const themeType of ["login", "account"] as const) {
        if (!fs.existsSync(pathJoin(themeSrcDirPath, themeType))) {
            continue;
        }

        implementedThemeTypes[themeType] = true;

        const themeTypeDirPath = getThemeTypeDirPath({ themeType });

        apply_replacers_and_move_to_theme_resources: {
            const destDirPath = pathJoin(
                themeTypeDirPath,
                "resources",
                basenameOfTheKeycloakifyResourcesDir
            );

            // NOTE: Prevent accumulation of files in the assets dir, as names are hashed they pile up.
            rmSync(destDirPath, { recursive: true, force: true });

            if (themeType === "account" && implementedThemeTypes.login) {
                // NOTE: We prevent doing it twice, it has been done for the login theme.

                transformCodebase({
                    srcDirPath: pathJoin(
                        getThemeTypeDirPath({
                            themeType: "login"
                        }),
                        "resources",
                        basenameOfTheKeycloakifyResourcesDir
                    ),
                    destDirPath
                });

                break apply_replacers_and_move_to_theme_resources;
            }

            transformCodebase({
                srcDirPath: buildOptions.projectBuildDirPath,
                destDirPath,
                transformSourceCode: ({ filePath, sourceCode }) => {
                    //NOTE: Prevent cycles, excludes the folder we generated for debug in public/
                    // This should not happen if users follow the new instruction setup but we keep it for retrocompatibility.
                    if (
                        isInside({
                            dirPath: pathJoin(
                                buildOptions.projectBuildDirPath,
                                keycloak_resources
                            ),
                            filePath
                        })
                    ) {
                        return undefined;
                    }

                    if (/\.css?$/i.test(filePath)) {
                        const {
                            cssGlobalsToDefine: cssGlobalsToDefineForThisFile,
                            fixedCssCode
                        } = replaceImportsInCssCode({
                            cssCode: sourceCode.toString("utf8")
                        });

                        Object.entries(cssGlobalsToDefineForThisFile).forEach(
                            ([key, value]) => {
                                cssGlobalsToDefine[key] = value;
                            }
                        );

                        return {
                            modifiedSourceCode: Buffer.from(fixedCssCode, "utf8")
                        };
                    }

                    if (/\.js?$/i.test(filePath)) {
                        const { fixedJsCode } = replaceImportsInJsCode({
                            jsCode: sourceCode.toString("utf8"),
                            buildOptions
                        });

                        return {
                            modifiedSourceCode: Buffer.from(fixedJsCode, "utf8")
                        };
                    }

                    return { modifiedSourceCode: sourceCode };
                }
            });
        }

        const { generateFtlFilesCode } = generateFtlFilesCodeFactory({
            themeName,
            indexHtmlCode: fs
                .readFileSync(pathJoin(buildOptions.projectBuildDirPath, "index.html"))
                .toString("utf8"),
            cssGlobalsToDefine,
            buildOptions,
            keycloakifyVersion: readThisNpmPackageVersion(),
            themeType,
            fieldNames: readFieldNameUsage({
                themeSrcDirPath,
                themeType
            })
        });

        [
            ...(() => {
                switch (themeType) {
                    case "login":
                        return loginThemePageIds;
                    case "account":
                        return accountThemePageIds;
                }
            })(),
            ...readExtraPagesNames({
                themeType,
                themeSrcDirPath
            })
        ].forEach(pageId => {
            const { ftlCode } = generateFtlFilesCode({ pageId });

            fs.mkdirSync(themeTypeDirPath, { recursive: true });

            fs.writeFileSync(
                pathJoin(themeTypeDirPath, pageId),
                Buffer.from(ftlCode, "utf8")
            );
        });

        generateMessageProperties({
            themeSrcDirPath,
            themeType
        }).forEach(({ languageTag, propertiesFileSource }) => {
            const messagesDirPath = pathJoin(themeTypeDirPath, "messages");

            fs.mkdirSync(pathJoin(themeTypeDirPath, "messages"), {
                recursive: true
            });

            const propertiesFilePath = pathJoin(
                messagesDirPath,
                `messages_${languageTag}.properties`
            );

            fs.writeFileSync(
                propertiesFilePath,
                Buffer.from(propertiesFileSource, "utf8")
            );
        });

        await downloadKeycloakStaticResources({
            keycloakVersion: (() => {
                switch (themeType) {
                    case "account":
                        return lastKeycloakVersionWithAccountV1;
                    case "login":
                        return buildOptions.loginThemeResourcesFromKeycloakVersion;
                }
            })(),
            themeDirPath: pathResolve(pathJoin(themeTypeDirPath, "..")),
            themeType,
            buildOptions
        });

        fs.writeFileSync(
            pathJoin(themeTypeDirPath, "theme.properties"),
            Buffer.from(
                [
                    `parent=${(() => {
                        switch (themeType) {
                            case "account":
                                return accountV1ThemeName;
                            case "login":
                                return "keycloak";
                        }
                        assert<Equals<typeof themeType, never>>(false);
                    })()}`,
                    ...(buildOptions.extraThemeProperties ?? []),
                    buildOptions.environmentVariables.map(
                        ({ name, default: defaultValue }) =>
                            `${name}=\${env.${name}:${escapeStringForPropertiesFile(defaultValue)}}`
                    )
                ].join("\n\n"),
                "utf8"
            )
        );
    }

    email: {
        const emailThemeSrcDirPath = pathJoin(themeSrcDirPath, "email");

        if (!fs.existsSync(emailThemeSrcDirPath)) {
            break email;
        }

        implementedThemeTypes.email = true;

        transformCodebase({
            srcDirPath: emailThemeSrcDirPath,
            destDirPath: getThemeTypeDirPath({ themeType: "email" })
        });
    }

    if (implementedThemeTypes.account) {
        await bringInAccountV1({
            buildOptions
        });
    }

    {
        const metaInfKeycloakThemes: MetaInfKeycloakTheme = { themes: [] };

        metaInfKeycloakThemes.themes.push({
            name: themeName,
            types: objectEntries(implementedThemeTypes)
                .filter(([, isImplemented]) => isImplemented)
                .map(([themeType]) => themeType)
        });

        if (implementedThemeTypes.account) {
            metaInfKeycloakThemes.themes.push({
                name: accountV1ThemeName,
                types: ["account"]
            });
        }

        writeMetaInfKeycloakThemes({
            keycloakifyBuildDirPath: buildOptions.keycloakifyBuildDirPath,
            metaInfKeycloakThemes
        });
    }
}
