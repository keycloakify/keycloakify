import type { BuildContext } from "../../shared/buildContext";
import fs from "fs";
import { rmSync } from "../../tools/fs.rmSync";
import { transformCodebase } from "../../tools/transformCodebase";
import {
    join as pathJoin,
    relative as pathRelative,
    dirname as pathDirname,
    extname as pathExtname,
    sep as pathSep
} from "path";
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
    WELL_KNOWN_DIRECTORY_BASE_NAME,
    THEME_TYPES,
    KEYCLOAKIFY_SPA_DEV_SERVER_PORT
} from "../../shared/constants";
import { assert, type Equals } from "tsafe/assert";
import { readFieldNameUsage } from "./readFieldNameUsage";
import { readExtraPagesNames } from "./readExtraPageNames";
import {
    generateMessageProperties,
    type BuildContextLike as BuildContextLike_generateMessageProperties
} from "./generateMessageProperties";
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
        themeNames: string[];
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

export async function generateResources(params: {
    buildContext: BuildContextLike;
    resourcesDirPath: string;
}): Promise<void> {
    const { resourcesDirPath, buildContext } = params;

    const [themeName] = buildContext.themeNames;

    if (fs.existsSync(resourcesDirPath)) {
        rmSync(resourcesDirPath, { recursive: true });
    }

    const getThemeTypeDirPath = (params: {
        themeType: ThemeType | "email";
        themeName: string;
    }) => {
        const { themeType, themeName } = params;
        return pathJoin(resourcesDirPath, "theme", themeName, themeType);
    };

    const writeMessagePropertiesFilesByThemeType: Partial<
        Record<ThemeType, (params: { messageDirPath: string; themeName: string }) => void>
    > = {};

    for (const themeType of THEME_TYPES) {
        if (!buildContext.implementedThemeTypes[themeType].isImplemented) {
            continue;
        }

        const getAccountThemeType = () => {
            assert(themeType === "account");

            assert(buildContext.implementedThemeTypes.account.isImplemented);

            return buildContext.implementedThemeTypes.account.type;
        };

        const isSpa = (() => {
            switch (themeType) {
                case "login":
                    return false;
                case "account":
                    return getAccountThemeType() === "Single-Page";
                case "admin":
                    return true;
            }
        })();

        const themeTypeDirPath = getThemeTypeDirPath({ themeName, themeType });

        apply_replacers_and_move_to_theme_resources: {
            const destDirPath = pathJoin(
                themeTypeDirPath,
                "resources",
                WELL_KNOWN_DIRECTORY_BASE_NAME.DIST
            );

            // NOTE: Prevent accumulation of files in the assets dir, as names are hashed they pile up.
            rmSync(destDirPath, { recursive: true, force: true });

            if (
                themeType !== "login" &&
                buildContext.implementedThemeTypes.login.isImplemented
            ) {
                // NOTE: We prevent doing it twice, it has been done for the login theme.

                transformCodebase({
                    srcDirPath: pathJoin(
                        getThemeTypeDirPath({
                            themeName,
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
            fieldNames: isSpa
                ? []
                : (assert(themeType !== "admin"),
                  readFieldNameUsage({
                      themeSrcDirPath: buildContext.themeSrcDirPath,
                      themeType
                  }))
        });

        [
            ...(() => {
                switch (themeType) {
                    case "login":
                        return LOGIN_THEME_PAGE_IDS;
                    case "account":
                        return getAccountThemeType() === "Single-Page"
                            ? ["index.ftl"]
                            : ACCOUNT_THEME_PAGE_IDS;
                    case "admin":
                        return ["index.ftl"];
                }
            })(),
            ...(isSpa
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
            if (isSpa) {
                break i18n_messages_generation;
            }

            assert(themeType !== "admin");

            const wrap = generateMessageProperties({
                buildContext,
                themeType
            });

            languageTags = wrap.languageTags;
            const { writeMessagePropertiesFiles } = wrap;

            writeMessagePropertiesFilesByThemeType[themeType] =
                writeMessagePropertiesFiles;
        }

        bring_in_spas_messages: {
            if (!isSpa) {
                break bring_in_spas_messages;
            }

            assert(themeType !== "login");

            const accountUiDirPath = child_process
                .execSync(`npm list @keycloakify/keycloak-${themeType}-ui --parseable`, {
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
                getThemeTypeDirPath({ themeName, themeType }),
                "messages"
            );

            transformCodebase({
                srcDirPath: messageDirPath_defaults,
                destDirPath: messagesDirPath_dest
            });

            apply_theme_changes: {
                const messagesDirPath_theme = pathJoin(
                    buildContext.themeSrcDirPath,
                    themeType,
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
            if (isSpa) {
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
                                switch (getAccountThemeType()) {
                                    case "Multi-Page":
                                        return "account-v1";
                                    case "Single-Page":
                                        return "base";
                                }
                            case "login":
                                return "keycloak";
                            case "admin":
                                return "base";
                        }
                        assert<Equals<typeof themeType, never>>(false);
                    })()}`,
                    ...(themeType === "account" && getAccountThemeType() === "Single-Page"
                        ? ["deprecatedMode=false"]
                        : []),
                    ...(buildContext.extraThemeProperties ?? []),
                    ...[
                        ...buildContext.environmentVariables,
                        { name: KEYCLOAKIFY_SPA_DEV_SERVER_PORT, default: "" }
                    ].map(
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
            destDirPath: getThemeTypeDirPath({ themeName, themeType: "email" })
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
            destDirPath: getThemeTypeDirPath({
                themeName: "account-v1",
                themeType: "account"
            })
        });
    }

    {
        const metaInfKeycloakThemes: MetaInfKeycloakTheme = { themes: [] };

        for (const themeName of buildContext.themeNames) {
            metaInfKeycloakThemes.themes.push({
                name: themeName,
                types: objectEntries(buildContext.implementedThemeTypes)
                    .filter(([, { isImplemented }]) => isImplemented)
                    .map(([themeType]) => themeType)
            });
        }

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

    for (const themeVariantName of buildContext.themeNames) {
        if (themeVariantName === themeName) {
            continue;
        }

        transformCodebase({
            srcDirPath: pathJoin(resourcesDirPath, "theme", themeName),
            destDirPath: pathJoin(resourcesDirPath, "theme", themeVariantName),
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
    }

    for (const themeName of buildContext.themeNames) {
        for (const [themeType, writeMessagePropertiesFiles] of objectEntries(
            writeMessagePropertiesFilesByThemeType
        )) {
            // NOTE: This is just a quirk of the type system: We can't really differentiate in a record
            // between the case where the key isn't present and the case where the value is `undefined`.
            if (writeMessagePropertiesFiles === undefined) {
                return;
            }
            writeMessagePropertiesFiles({
                messageDirPath: pathJoin(
                    getThemeTypeDirPath({ themeName, themeType }),
                    "messages"
                ),
                themeName
            });
        }
    }

    modify_email_theme_per_variant: {
        if (!buildContext.implementedThemeTypes.email.isImplemented) {
            break modify_email_theme_per_variant;
        }

        for (const themeName of buildContext.themeNames) {
            const emailThemeDirPath = getThemeTypeDirPath({
                themeName,
                themeType: "email"
            });

            transformCodebase({
                srcDirPath: emailThemeDirPath,
                destDirPath: emailThemeDirPath,
                transformSourceCode: ({ filePath, sourceCode }) => {
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
}
