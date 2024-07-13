import { transformCodebase } from "../../tools/transformCodebase";
import * as fs from "fs";
import {
    join as pathJoin,
    resolve as pathResolve,
    relative as pathRelative,
    dirname as pathDirname,
    basename as pathBasename
} from "path";
import { replaceImportsInJsCode } from "../replacers/replaceImportsInJsCode";
import { replaceImportsInCssCode } from "../replacers/replaceImportsInCssCode";
import {
    generateFtlFilesCodeFactory,
    type BuildContextLike as BuildContextLike_kcContextExclusionsFtlCode
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
import type { BuildContext } from "../../shared/buildContext";
import { assert, type Equals } from "tsafe/assert";
import {
    downloadKeycloakStaticResources,
    type BuildContextLike as BuildContextLike_downloadKeycloakStaticResources
} from "../../shared/downloadKeycloakStaticResources";
import { readFieldNameUsage } from "./readFieldNameUsage";
import { readExtraPagesNames } from "./readExtraPageNames";
import { generateMessageProperties } from "./generateMessageProperties";
import {
    bringInAccountV1,
    type BuildContextLike as BuildContextLike_bringInAccountV1
} from "./bringInAccountV1";
import { rmSync } from "../../tools/fs.rmSync";
import { readThisNpmPackageVersion } from "../../tools/readThisNpmPackageVersion";
import {
    writeMetaInfKeycloakThemes,
    type MetaInfKeycloakTheme
} from "../../shared/metaInfKeycloakThemes";
import { objectEntries } from "tsafe/objectEntries";
import { escapeStringForPropertiesFile } from "../../tools/escapeStringForPropertiesFile";
import { downloadAndExtractArchive } from "../../tools/downloadAndExtractArchive";

export type BuildContextLike = BuildContextLike_kcContextExclusionsFtlCode &
    BuildContextLike_downloadKeycloakStaticResources &
    BuildContextLike_bringInAccountV1 & {
        extraThemeProperties: string[] | undefined;
        loginThemeResourcesFromKeycloakVersion: string;
        projectDirPath: string;
        projectBuildDirPath: string;
        environmentVariables: { name: string; default: string }[];
        recordIsImplementedByThemeType: BuildContext["recordIsImplementedByThemeType"];
        themeSrcDirPath: string;
        bundler: { type: "vite" } | { type: "webpack" };
        doUseAccountV3: boolean;
    };

assert<BuildContext extends BuildContextLike ? true : false>();

export async function generateResourcesForMainTheme(params: {
    themeName: string;
    resourcesDirPath: string;
    buildContext: BuildContextLike;
}): Promise<void> {
    const { themeName, resourcesDirPath, buildContext } = params;

    const getThemeTypeDirPath = (params: { themeType: ThemeType | "email" }) => {
        const { themeType } = params;
        return pathJoin(resourcesDirPath, "theme", themeName, themeType);
    };

    for (const themeType of ["login", "account"] as const) {
        const isAccountV3 = themeType === "account" && buildContext.doUseAccountV3;
        if (!buildContext.recordIsImplementedByThemeType[themeType]) {
            continue;
        }

        const themeTypeDirPath = getThemeTypeDirPath({ themeType });

        apply_replacers_and_move_to_theme_resources: {
            const destDirPath = pathJoin(
                themeTypeDirPath,
                "resources",
                basenameOfTheKeycloakifyResourcesDir
            );

            // NOTE: Prevent accumulation of files in the assets dir, as names are hashed they pile up.
            rmSync(destDirPath, { recursive: true, force: true });

            if (
                themeType === "account" &&
                buildContext.recordIsImplementedByThemeType.login
            ) {
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

            {
                const dirPath = pathJoin(
                    buildContext.projectBuildDirPath,
                    keycloak_resources
                );

                if (fs.existsSync(dirPath)) {
                    assert(buildContext.bundler.type === "webpack");

                    throw new Error(
                        [
                            `Keycloakify build error: The ${keycloak_resources} directory shouldn't exist in your build directory.`,
                            `(${pathRelative(process.cwd(), dirPath)}).\n`,
                            `Theses assets are only required for local development with Storybook.",
                            "Please remove this directory as an additional step of your command.\n`,
                            `For example: \`"build": "... && rimraf ${pathRelative(buildContext.projectDirPath, dirPath)}"\``
                        ].join(" ")
                    );
                }
            }

            transformCodebase({
                srcDirPath: buildContext.projectBuildDirPath,
                destDirPath,
                transformSourceCode: ({ filePath, fileRelativePath, sourceCode }) => {
                    if (filePath.endsWith(".css")) {
                        const { fixedCssCode } = replaceImportsInCssCode({
                            cssCode: sourceCode.toString("utf8"),
                            cssFileRelativeDirPath: pathDirname(fileRelativePath),
                            buildContext
                        });

                        return {
                            modifiedSourceCode: Buffer.from(fixedCssCode, "utf8")
                        };
                    }

                    if (filePath.endsWith(".js")) {
                        const { fixedJsCode } = replaceImportsInJsCode({
                            jsCode: sourceCode.toString("utf8"),
                            buildContext
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
                .readFileSync(pathJoin(buildContext.projectBuildDirPath, "index.html"))
                .toString("utf8"),
            buildContext,
            keycloakifyVersion: readThisNpmPackageVersion(),
            themeType,
            fieldNames: readFieldNameUsage({
                themeSrcDirPath: buildContext.themeSrcDirPath,
                themeType
            })
        });

        [
            ...(() => {
                switch (themeType) {
                    case "login":
                        return loginThemePageIds;
                    case "account":
                        return isAccountV3 ? ["index.ftl"] : accountThemePageIds;
                }
            })(),
            ...(isAccountV3
                ? []
                : readExtraPagesNames({
                      themeType,
                      themeSrcDirPath: buildContext.themeSrcDirPath
                  }))
        ].forEach(pageId => {
            const { ftlCode } = generateFtlFilesCode({ pageId });

            fs.writeFileSync(
                pathJoin(themeTypeDirPath, pageId),
                Buffer.from(ftlCode, "utf8")
            );
        });

        i18n_messages_generation: {
            if (isAccountV3) {
                break i18n_messages_generation;
            }

            generateMessageProperties({
                themeSrcDirPath: buildContext.themeSrcDirPath,
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
        }

        keycloak_static_resources: {
            if (isAccountV3) {
                break keycloak_static_resources;
            }

            await downloadKeycloakStaticResources({
                keycloakVersion: (() => {
                    switch (themeType) {
                        case "account":
                            return lastKeycloakVersionWithAccountV1;
                        case "login":
                            return buildContext.loginThemeResourcesFromKeycloakVersion;
                    }
                })(),
                themeDirPath: pathResolve(pathJoin(themeTypeDirPath, "..")),
                themeType,
                buildContext
            });
        }

        fs.writeFileSync(
            pathJoin(themeTypeDirPath, "theme.properties"),
            Buffer.from(
                [
                    `parent=${(() => {
                        switch (themeType) {
                            case "account":
                                return isAccountV3 ? "base" : accountV1ThemeName;
                            case "login":
                                return "keycloak";
                        }
                        assert<Equals<typeof themeType, never>>(false);
                    })()}`,
                    ...(isAccountV3 ? ["deprecatedMode=false"] : []),
                    ...(buildContext.extraThemeProperties ?? []),
                    ...buildContext.environmentVariables.map(
                        ({ name, default: defaultValue }) =>
                            `${name}=\${env.${name}:${escapeStringForPropertiesFile(defaultValue)}}`
                    )
                ].join("\n\n"),
                "utf8"
            )
        );
    }

    email: {
        if (!buildContext.recordIsImplementedByThemeType.email) {
            break email;
        }

        const emailThemeSrcDirPath = pathJoin(buildContext.themeSrcDirPath, "email");

        transformCodebase({
            srcDirPath: emailThemeSrcDirPath,
            destDirPath: getThemeTypeDirPath({ themeType: "email" })
        });
    }

    bring_in_account_v1: {
        if (buildContext.doUseAccountV3) {
            break bring_in_account_v1;
        }

        if (!buildContext.recordIsImplementedByThemeType.account) {
            break bring_in_account_v1;
        }

        await bringInAccountV1({
            resourcesDirPath,
            buildContext
        });
    }

    bring_in_account_v3_i18n_messages: {
        if (!buildContext.doUseAccountV3) {
            break bring_in_account_v3_i18n_messages;
        }

        const { extractedDirPath } = await downloadAndExtractArchive({
            url: "https://repo1.maven.org/maven2/org/keycloak/keycloak-account-ui/25.0.1/keycloak-account-ui-25.0.1.jar",
            cacheDirPath: buildContext.cacheDirPath,
            fetchOptions: buildContext.fetchOptions,
            uniqueIdOfOnArchiveFile: "bring_in_account_v3_i18n_messages",
            onArchiveFile: async ({ fileRelativePath, writeFile }) => {
                if (
                    !fileRelativePath.startsWith(
                        pathJoin("theme", "keycloak.v3", "account", "messages")
                    )
                ) {
                    return;
                }
                await writeFile({
                    fileRelativePath: pathBasename(fileRelativePath)
                });
            }
        });

        transformCodebase({
            srcDirPath: extractedDirPath,
            destDirPath: pathJoin(
                getThemeTypeDirPath({ themeType: "account" }),
                "messages"
            )
        });
    }

    {
        const metaInfKeycloakThemes: MetaInfKeycloakTheme = { themes: [] };

        metaInfKeycloakThemes.themes.push({
            name: themeName,
            types: objectEntries(buildContext.recordIsImplementedByThemeType)
                .filter(([, isImplemented]) => isImplemented)
                .map(([themeType]) => themeType)
        });

        if (buildContext.recordIsImplementedByThemeType.account) {
            metaInfKeycloakThemes.themes.push({
                name: accountV1ThemeName,
                types: ["account"]
            });
        }

        writeMetaInfKeycloakThemes({
            resourcesDirPath,
            getNewMetaInfKeycloakTheme: () => metaInfKeycloakThemes
        });
    }
}
