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
import { escapeStringForPropertiesFile } from "../../tools/escapeStringForPropertiesFile";
import { getThisCodebaseRootDirPath } from "../../tools/getThisCodebaseRootDirPath";
import propertiesParser from "properties-parser";
import { createObjectThatThrowsIfAccessed } from "../../tools/createObjectThatThrowsIfAccessed";
import { listInstalledModules } from "../../tools/listInstalledModules";
import { isInside } from "../../tools/isInside";

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
    const start = Date.now();

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
        Record<
            ThemeType | "email",
            (params: { messageDirPath: string; themeName: string }) => void
        >
    > = {};

    for (const themeType of [...THEME_TYPES, "email"] as const) {
        let isNative: boolean;

        {
            const v = buildContext.implementedThemeTypes[themeType];

            if (!v.isImplemented && !v.isImplemented_native) {
                continue;
            }

            isNative = !v.isImplemented && v.isImplemented_native;
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
                case "email":
                    return false;
            }
        })();

        const themeTypeDirPath = getThemeTypeDirPath({ themeName, themeType });

        apply_replacers_and_move_to_theme_resources: {
            if (isNative) {
                break apply_replacers_and_move_to_theme_resources;
            }

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

        generate_ftl_files: {
            if (isNative) {
                break generate_ftl_files;
            }

            assert(themeType !== "email");

            const { generateFtlFilesCode } = generateFtlFilesCodeFactory({
                themeName,
                indexHtmlCode: fs
                    .readFileSync(
                        pathJoin(buildContext.projectBuildDirPath, "index.html")
                    )
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
        }

        copy_native_theme: {
            if (!isNative) {
                break copy_native_theme;
            }

            const dirPath = pathJoin(buildContext.themeSrcDirPath, themeType);

            transformCodebase({
                srcDirPath: dirPath,
                destDirPath: getThemeTypeDirPath({ themeName, themeType }),
                transformSourceCode: ({ fileRelativePath, sourceCode }) => {
                    if (isInside({ dirPath: "messages", filePath: fileRelativePath })) {
                        return undefined;
                    }

                    return { modifiedSourceCode: sourceCode };
                }
            });
        }

        let languageTags: string[] | undefined = undefined;

        i18n_multi_page: {
            if (isNative) {
                break i18n_multi_page;
            }

            if (isSpa) {
                break i18n_multi_page;
            }

            assert(themeType !== "admin" && themeType !== "email");

            const wrap = generateMessageProperties({
                buildContext,
                themeType
            });

            languageTags = wrap.languageTags;
            const { writeMessagePropertiesFiles } = wrap;

            writeMessagePropertiesFilesByThemeType[themeType] =
                writeMessagePropertiesFiles;
        }

        let isLegacyAccountSpa = false;

        // NOTE: Eventually remove this block.
        i18n_single_page_account_legacy: {
            if (!isSpa) {
                break i18n_single_page_account_legacy;
            }

            if (themeType !== "account") {
                break i18n_single_page_account_legacy;
            }

            const [moduleMeta] = await listInstalledModules({
                packageJsonFilePath: buildContext.packageJsonFilePath,
                filter: ({ moduleName }) =>
                    moduleName === "@keycloakify/keycloak-account-ui"
            });

            assert(
                moduleMeta !== undefined,
                `@keycloakify/keycloak-account-ui is supposed to be installed`
            );

            {
                const [majorStr] = moduleMeta.version.split(".");

                if (majorStr.length === 6) {
                    // NOTE: Now we use the format MMmmpp (Major, minor, patch) for example for
                    // 26.0.7 it would be 260007.
                    break i18n_single_page_account_legacy;
                } else {
                    // 25.0.4-rc.5 or later
                    isLegacyAccountSpa = true;
                }
            }

            const messageDirPath_defaults = pathJoin(moduleMeta.dirPath, "messages");

            if (!fs.existsSync(messageDirPath_defaults)) {
                throw new Error(
                    `Please update @keycloakify/keycloak-account-ui to 25.0.4-rc.5 or later.`
                );
            }

            isLegacyAccountSpa = true;

            const messagesDirPath_dest = pathJoin(
                getThemeTypeDirPath({ themeName, themeType: "account" }),
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

        i18n_for_spas_and_native: {
            if (!isSpa && !isNative) {
                break i18n_for_spas_and_native;
            }

            if (isLegacyAccountSpa) {
                break i18n_for_spas_and_native;
            }

            const messagesDirPath_theme = pathJoin(
                buildContext.themeSrcDirPath,
                themeType,
                isNative ? "messages" : "i18n"
            );

            if (!fs.existsSync(messagesDirPath_theme)) {
                break i18n_for_spas_and_native;
            }

            const propertiesByLang: Record<
                string,
                {
                    base: Buffer;
                    override: Buffer | undefined;
                    overrideByThemeName: Record<string, Buffer>;
                }
            > = {};

            fs.readdirSync(messagesDirPath_theme).forEach(basename => {
                type ParsedBasename = { lang: string } & (
                    | {
                          isOverride: false;
                      }
                    | {
                          isOverride: true;
                          themeName: string | undefined;
                      }
                );

                const parsedBasename = ((): ParsedBasename | undefined => {
                    const match = basename.match(/^messages_([^.]+)\.properties$/);

                    if (match === null) {
                        return undefined;
                    }

                    const discriminator = match[1];

                    const split = discriminator.split("_override");

                    if (split.length === 1) {
                        return {
                            lang: discriminator,
                            isOverride: false
                        };
                    }

                    assert(split.length === 2);

                    if (split[1] === "") {
                        return {
                            lang: split[0],
                            isOverride: true,
                            themeName: undefined
                        };
                    }

                    const match2 = split[1].match(/^_(.+)$/);

                    assert(match2 !== null);

                    return {
                        lang: split[0],
                        isOverride: true,
                        themeName: match2[1]
                    };
                })();

                if (parsedBasename === undefined) {
                    return;
                }

                propertiesByLang[parsedBasename.lang] ??= {
                    base: createObjectThatThrowsIfAccessed<Buffer>({
                        debugMessage: `No base ${parsedBasename.lang} translation for ${themeType} theme`
                    }),
                    override: undefined,
                    overrideByThemeName: {}
                };

                const buffer = fs.readFileSync(pathJoin(messagesDirPath_theme, basename));

                if (parsedBasename.isOverride === false) {
                    propertiesByLang[parsedBasename.lang].base = buffer;
                    return;
                }

                if (parsedBasename.themeName === undefined) {
                    propertiesByLang[parsedBasename.lang].override = buffer;
                    return;
                }

                propertiesByLang[parsedBasename.lang].overrideByThemeName[
                    parsedBasename.themeName
                ] = buffer;
            });

            languageTags = Object.keys(propertiesByLang);

            writeMessagePropertiesFilesByThemeType[themeType] = ({
                messageDirPath,
                themeName
            }) => {
                if (!fs.existsSync(messageDirPath)) {
                    fs.mkdirSync(messageDirPath, { recursive: true });
                }

                Object.entries(propertiesByLang).forEach(
                    ([lang, { base, override, overrideByThemeName }]) => {
                        const messages = propertiesParser.parse(base.toString("utf8"));

                        if (override !== undefined) {
                            const overrideMessages = propertiesParser.parse(
                                override.toString("utf8")
                            );

                            Object.entries(overrideMessages).forEach(
                                ([key, value]) => (messages[key] = value)
                            );
                        }

                        if (themeName in overrideByThemeName) {
                            const overrideMessages = propertiesParser.parse(
                                overrideByThemeName[themeName].toString("utf8")
                            );

                            Object.entries(overrideMessages).forEach(
                                ([key, value]) => (messages[key] = value)
                            );
                        }

                        const editor = propertiesParser.createEditor();

                        Object.entries(messages).forEach(([key, value]) => {
                            editor.set(key, value);
                        });

                        fs.writeFileSync(
                            pathJoin(messageDirPath, `messages_${lang}.properties`),
                            Buffer.from(editor.toString(), "utf8")
                        );
                    }
                );
            };
        }

        keycloak_static_resources: {
            if (isNative) {
                break keycloak_static_resources;
            }

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

        bring_in_account_v1: {
            if (isNative) {
                break bring_in_account_v1;
            }

            if (themeType !== "account") {
                break bring_in_account_v1;
            }

            assert(buildContext.implementedThemeTypes.account.isImplemented);

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

        generate_theme_properties: {
            if (isNative) {
                break generate_theme_properties;
            }

            assert(themeType !== "email");

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
                            assert<Equals<typeof themeType, never>>;
                        })()}`,
                        ...(themeType === "account" &&
                        getAccountThemeType() === "Single-Page"
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
    }

    for (const themeVariantName of buildContext.themeNames) {
        for (const themeType of [...THEME_TYPES, "email"] as const) {
            copy_main_theme_to_theme_variant_theme: {
                let isNative: boolean;

                {
                    const v = buildContext.implementedThemeTypes[themeType];

                    if (!v.isImplemented && !v.isImplemented_native) {
                        break copy_main_theme_to_theme_variant_theme;
                    }

                    isNative = !v.isImplemented && v.isImplemented_native;
                }

                if (themeVariantName === themeName) {
                    break copy_main_theme_to_theme_variant_theme;
                }

                transformCodebase({
                    srcDirPath: pathJoin(resourcesDirPath, "theme", themeName, themeType),
                    destDirPath: pathJoin(
                        resourcesDirPath,
                        "theme",
                        themeVariantName,
                        themeType
                    ),
                    transformSourceCode: isNative
                        ? undefined
                        : ({ fileRelativePath, sourceCode }) => {
                              if (
                                  pathExtname(fileRelativePath) === ".ftl" &&
                                  fileRelativePath.split(pathSep).length === 1
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

                                  assert(
                                      Buffer.compare(modifiedSourceCode, sourceCode) !== 0
                                  );

                                  return { modifiedSourceCode };
                              }

                              return { modifiedSourceCode: sourceCode };
                          }
                });
            }
            run_writeMessagePropertiesFiles: {
                const writeMessagePropertiesFiles =
                    writeMessagePropertiesFilesByThemeType[themeType];

                if (writeMessagePropertiesFiles === undefined) {
                    break run_writeMessagePropertiesFiles;
                }

                writeMessagePropertiesFiles({
                    messageDirPath: pathJoin(
                        getThemeTypeDirPath({ themeName: themeVariantName, themeType }),
                        "messages"
                    ),
                    themeName: themeVariantName
                });
            }
            replace_xKeycloakify_themeName_in_native_ftl_files: {
                {
                    const v = buildContext.implementedThemeTypes[themeType];

                    if (v.isImplemented || !v.isImplemented_native) {
                        break replace_xKeycloakify_themeName_in_native_ftl_files;
                    }
                }

                const emailThemeDirPath = getThemeTypeDirPath({
                    themeName: themeVariantName,
                    themeType
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
                                    .replace(
                                        /xKeycloakify\.themeName/g,
                                        `"${themeVariantName}"`
                                    ),
                                "utf8"
                            )
                        };
                    }
                });
            }
        }
    }

    console.log(`Generated resources in ${Date.now() - start}ms`);
}
