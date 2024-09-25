import { transformCodebase } from "../../tools/transformCodebase";
import * as fs from "fs";
import { join as pathJoin, relative as pathRelative, dirname as pathDirname } from "path";
import { replaceImportsInJsCode } from "../replacers/replaceImportsInJsCode";
import { replaceImportsInCssCode } from "../replacers/replaceImportsInCssCode";
import {
    generateFtlFilesCodeFactory,
    type BuildContextLike as BuildContextLike_kcContextExclusionsFtlCode
} from "../generateFtl";
import {
    type ThemeType,
    LOGIN_THEME_PAGE_IDS,
    ACCOUNT_THEME_PAGE_IDS,
    WELL_KNOWN_DIRECTORY_BASE_NAME
} from "../../shared/constants";
import type { BuildContext } from "../../shared/buildContext";
import { assert, type Equals } from "tsafe/assert";
import { readFieldNameUsage } from "./readFieldNameUsage";
import { readExtraPagesNames } from "./readExtraPageNames";
import {
    generateMessageProperties,
    type BuildContextLike as BuildContextLike_generateMessageProperties
} from "./generateMessageProperties";
import { rmSync } from "../../tools/fs.rmSync";
import { readThisNpmPackageVersion } from "../../tools/readThisNpmPackageVersion";
import {
    writeMetaInfKeycloakThemes,
    type MetaInfKeycloakTheme
} from "../../shared/metaInfKeycloakThemes";
import { objectEntries } from "tsafe/objectEntries";
import { escapeStringForPropertiesFile } from "../../tools/escapeStringForPropertiesFile";
import * as child_process from "child_process";
import { getThisCodebaseRootDirPath } from "../../tools/getThisCodebaseRootDirPath";
import propertiesParser from "properties-parser";

export type BuildContextLike = BuildContextLike_kcContextExclusionsFtlCode &
    BuildContextLike_generateMessageProperties & {
        extraThemeProperties: string[] | undefined;
        projectDirPath: string;
        projectBuildDirPath: string;
        environmentVariables: { name: string; default: string }[];
        implementedThemeTypes: BuildContext["implementedThemeTypes"];
        themeSrcDirPath: string;
        bundler: "vite" | "webpack";
        packageJsonFilePath: string;
    };

assert<BuildContext extends BuildContextLike ? true : false>();

export async function generateResourcesForMainTheme(params: {
    buildContext: BuildContextLike;
    themeName: string;
    resourcesDirPath: string;
}): Promise<{
    writeMessagePropertiesFilesForThemeVariant: (params: {
        getMessageDirPath: (params: { themeType: ThemeType }) => string;
        themeName: string;
    }) => void;
}> {
    const { themeName, resourcesDirPath, buildContext } = params;

    const getThemeTypeDirPath = (params: { themeType: ThemeType | "email" }) => {
        const { themeType } = params;
        return pathJoin(resourcesDirPath, "theme", themeName, themeType);
    };

    const writeMessagePropertiesFilesByThemeType: Partial<
        Record<ThemeType, (params: { messageDirPath: string; themeName: string }) => void>
    > = {};

    for (const themeType of ["login", "account"] as const) {
        if (!buildContext.implementedThemeTypes[themeType].isImplemented) {
            continue;
        }

        const isForAccountSpa =
            themeType === "account" &&
            (assert(buildContext.implementedThemeTypes.account.isImplemented),
            buildContext.implementedThemeTypes.account.type === "Single-Page");

        const themeTypeDirPath = getThemeTypeDirPath({ themeType });

        apply_replacers_and_move_to_theme_resources: {
            const destDirPath = pathJoin(
                themeTypeDirPath,
                "resources",
                WELL_KNOWN_DIRECTORY_BASE_NAME.DIST
            );

            // NOTE: Prevent accumulation of files in the assets dir, as names are hashed they pile up.
            rmSync(destDirPath, { recursive: true, force: true });

            if (
                themeType === "account" &&
                buildContext.implementedThemeTypes.login.isImplemented
            ) {
                // NOTE: We prevent doing it twice, it has been done for the login theme.

                transformCodebase({
                    srcDirPath: pathJoin(
                        getThemeTypeDirPath({
                            themeType: "login"
                        }),
                        "resources",
                        WELL_KNOWN_DIRECTORY_BASE_NAME.DIST
                    ),
                    destDirPath
                });

                break apply_replacers_and_move_to_theme_resources;
            }

            {
                const dirPath = pathJoin(
                    buildContext.projectBuildDirPath,
                    WELL_KNOWN_DIRECTORY_BASE_NAME.KEYCLOAKIFY_DEV_RESOURCES
                );

                if (fs.existsSync(dirPath)) {
                    assert(buildContext.bundler === "webpack");

                    throw new Error(
                        [
                            `Keycloakify build error: The ${WELL_KNOWN_DIRECTORY_BASE_NAME.KEYCLOAKIFY_DEV_RESOURCES} directory shouldn't exist in your build directory.`,
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
                        return LOGIN_THEME_PAGE_IDS;
                    case "account":
                        return isForAccountSpa ? ["index.ftl"] : ACCOUNT_THEME_PAGE_IDS;
                }
            })(),
            ...(isForAccountSpa
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

        let languageTags: string[] | undefined = undefined;

        i18n_messages_generation: {
            if (isForAccountSpa) {
                break i18n_messages_generation;
            }

            const wrap = generateMessageProperties({
                buildContext,
                themeType
            });

            languageTags = wrap.languageTags;
            const { writeMessagePropertiesFiles } = wrap;

            writeMessagePropertiesFilesByThemeType[themeType] =
                writeMessagePropertiesFiles;

            writeMessagePropertiesFiles({
                messageDirPath: pathJoin(themeTypeDirPath, "messages"),
                themeName
            });
        }

        bring_in_account_v3_i18n_messages: {
            if (!buildContext.implementedThemeTypes.account.isImplemented) {
                break bring_in_account_v3_i18n_messages;
            }
            if (buildContext.implementedThemeTypes.account.type !== "Single-Page") {
                break bring_in_account_v3_i18n_messages;
            }

            const accountUiDirPath = child_process
                .execSync("npm list @keycloakify/keycloak-account-ui --parseable", {
                    cwd: pathDirname(buildContext.packageJsonFilePath)
                })
                .toString("utf8")
                .trim();

            const messageDirPath_defaults = pathJoin(accountUiDirPath, "messages");

            if (!fs.existsSync(messageDirPath_defaults)) {
                throw new Error(
                    `Please update @keycloakify/keycloak-account-ui to 25.0.4-rc.5 or later.`
                );
            }

            const messagesDirPath_dest = pathJoin(
                getThemeTypeDirPath({ themeType: "account" }),
                "messages"
            );

            transformCodebase({
                srcDirPath: messageDirPath_defaults,
                destDirPath: messagesDirPath_dest
            });

            apply_theme_changes: {
                const messagesDirPath_theme = pathJoin(
                    buildContext.themeSrcDirPath,
                    "account",
                    "messages"
                );

                if (!fs.existsSync(messagesDirPath_theme)) {
                    break apply_theme_changes;
                }

                fs.readdirSync(messagesDirPath_theme).forEach(basename => {
                    const filePath_src = pathJoin(messagesDirPath_theme, basename);
                    const filePath_dest = pathJoin(messagesDirPath_dest, basename);

                    if (!fs.existsSync(filePath_dest)) {
                        fs.cpSync(filePath_src, filePath_dest);
                    }

                    const messages_src = propertiesParser.parse(
                        fs.readFileSync(filePath_src).toString("utf8")
                    );
                    const messages_dest = propertiesParser.parse(
                        fs.readFileSync(filePath_dest).toString("utf8")
                    );

                    const messages = {
                        ...messages_dest,
                        ...messages_src
                    };

                    const editor = propertiesParser.createEditor();

                    Object.entries(messages).forEach(([key, value]) => {
                        editor.set(key, value);
                    });

                    fs.writeFileSync(
                        filePath_dest,
                        Buffer.from(editor.toString(), "utf8")
                    );
                });
            }

            languageTags = fs
                .readdirSync(messagesDirPath_dest)
                .map(basename =>
                    basename.replace(/^messages_/, "").replace(/\.properties$/, "")
                );
        }

        keycloak_static_resources: {
            if (isForAccountSpa) {
                break keycloak_static_resources;
            }

            transformCodebase({
                srcDirPath: pathJoin(
                    getThisCodebaseRootDirPath(),
                    "res",
                    "public",
                    WELL_KNOWN_DIRECTORY_BASE_NAME.KEYCLOAKIFY_DEV_RESOURCES,
                    themeType
                ),
                destDirPath: pathJoin(themeTypeDirPath, "resources")
            });
        }

        fs.writeFileSync(
            pathJoin(themeTypeDirPath, "theme.properties"),
            Buffer.from(
                [
                    `parent=${(() => {
                        switch (themeType) {
                            case "account":
                                return isForAccountSpa ? "base" : "account-v1";
                            case "login":
                                return "keycloak";
                        }
                        assert<Equals<typeof themeType, never>>(false);
                    })()}`,
                    ...(isForAccountSpa ? ["deprecatedMode=false"] : []),
                    ...(buildContext.extraThemeProperties ?? []),
                    ...buildContext.environmentVariables.map(
                        ({ name, default: defaultValue }) =>
                            `${name}=\${env.${name}:${escapeStringForPropertiesFile(defaultValue)}}`
                    ),
                    ...(languageTags === undefined
                        ? []
                        : [`locales=${languageTags.join(",")}`])
                ].join("\n\n"),
                "utf8"
            )
        );
    }

    email: {
        if (!buildContext.implementedThemeTypes.email.isImplemented) {
            break email;
        }

        const emailThemeSrcDirPath = pathJoin(buildContext.themeSrcDirPath, "email");

        transformCodebase({
            srcDirPath: emailThemeSrcDirPath,
            destDirPath: getThemeTypeDirPath({ themeType: "email" })
        });
    }

    bring_in_account_v1: {
        if (!buildContext.implementedThemeTypes.account.isImplemented) {
            break bring_in_account_v1;
        }

        if (buildContext.implementedThemeTypes.account.type !== "Multi-Page") {
            break bring_in_account_v1;
        }

        transformCodebase({
            srcDirPath: pathJoin(getThisCodebaseRootDirPath(), "res", "account-v1"),
            destDirPath: pathJoin(resourcesDirPath, "theme", "account-v1", "account")
        });
    }

    {
        const metaInfKeycloakThemes: MetaInfKeycloakTheme = { themes: [] };

        metaInfKeycloakThemes.themes.push({
            name: themeName,
            types: objectEntries(buildContext.implementedThemeTypes)
                .filter(([, { isImplemented }]) => isImplemented)
                .map(([themeType]) => themeType)
        });

        if (buildContext.implementedThemeTypes.account.isImplemented) {
            metaInfKeycloakThemes.themes.push({
                name: "account-v1",
                types: ["account"]
            });
        }

        writeMetaInfKeycloakThemes({
            resourcesDirPath,
            getNewMetaInfKeycloakTheme: () => metaInfKeycloakThemes
        });
    }

    return {
        writeMessagePropertiesFilesForThemeVariant: ({
            getMessageDirPath,
            themeName
        }) => {
            objectEntries(writeMessagePropertiesFilesByThemeType).forEach(
                ([themeType, writeMessagePropertiesFiles]) => {
                    if (writeMessagePropertiesFiles === undefined) {
                        return;
                    }
                    writeMessagePropertiesFiles({
                        messageDirPath: getMessageDirPath({ themeType }),
                        themeName
                    });
                }
            );
        }
    };
}
