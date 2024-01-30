import { transformCodebase } from "../../tools/transformCodebase";
import * as fs from "fs";
import { join as pathJoin, resolve as pathResolve } from "path";
import { replaceImportsFromStaticInJsCode } from "../replacers/replaceImportsFromStaticInJsCode";
import { replaceImportsInCssCode } from "../replacers/replaceImportsInCssCode";
import { generateFtlFilesCodeFactory, loginThemePageIds, accountThemePageIds } from "../generateFtl";
import {
    themeTypes,
    type ThemeType,
    lastKeycloakVersionWithAccountV1,
    keycloak_resources,
    accountV1ThemeName,
    basenameOfTheKeycloakifyResourcesDir
} from "../../constants";
import { isInside } from "../../tools/isInside";
import type { BuildOptions } from "../buildOptions";
import { assert, type Equals } from "tsafe/assert";
import { downloadKeycloakStaticResources } from "./downloadKeycloakStaticResources";
import { readFieldNameUsage } from "./readFieldNameUsage";
import { readExtraPagesNames } from "./readExtraPageNames";
import { generateMessageProperties } from "./generateMessageProperties";
import { readStaticResourcesUsage } from "./readStaticResourcesUsage";

export type BuildOptionsLike = {
    extraThemeProperties: string[] | undefined;
    themeVersion: string;
    loginThemeResourcesFromKeycloakVersion: string;
    keycloakifyBuildDirPath: string;
    reactAppBuildDirPath: string;
    cacheDirPath: string;
};

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export async function generateTheme(params: {
    themeName: string;
    themeSrcDirPath: string;
    keycloakifySrcDirPath: string;
    buildOptions: BuildOptionsLike;
    keycloakifyVersion: string;
}): Promise<void> {
    const { themeName, themeSrcDirPath, keycloakifySrcDirPath, buildOptions, keycloakifyVersion } = params;

    const getThemeTypeDirPath = (params: { themeType: ThemeType | "email" }) => {
        const { themeType } = params;
        return pathJoin(buildOptions.keycloakifyBuildDirPath, "src", "main", "resources", "theme", themeName, themeType);
    };

    let allCssGlobalsToDefine: Record<string, string> = {};

    let generateFtlFilesCode_glob: ReturnType<typeof generateFtlFilesCodeFactory>["generateFtlFilesCode"] | undefined = undefined;

    for (const themeType of themeTypes) {
        if (!fs.existsSync(pathJoin(themeSrcDirPath, themeType))) {
            continue;
        }

        const themeTypeDirPath = getThemeTypeDirPath({ themeType });

        copy_app_resources_to_theme_path: {
            const isFirstPass = themeType.indexOf(themeType) === 0;

            if (!isFirstPass) {
                break copy_app_resources_to_theme_path;
            }

            transformCodebase({
                "destDirPath": pathJoin(themeTypeDirPath, "resources", basenameOfTheKeycloakifyResourcesDir),
                "srcDirPath": buildOptions.reactAppBuildDirPath,
                "transformSourceCode": ({ filePath, sourceCode }) => {
                    //NOTE: Prevent cycles, excludes the folder we generated for debug in public/
                    if (
                        isInside({
                            "dirPath": pathJoin(buildOptions.reactAppBuildDirPath, keycloak_resources),
                            filePath
                        })
                    ) {
                        return undefined;
                    }

                    if (/\.css?$/i.test(filePath)) {
                        const { cssGlobalsToDefine, fixedCssCode } = replaceImportsInCssCode({
                            "cssCode": sourceCode.toString("utf8")
                        });

                        register_css_variables: {
                            if (!isFirstPass) {
                                break register_css_variables;
                            }

                            allCssGlobalsToDefine = {
                                ...allCssGlobalsToDefine,
                                ...cssGlobalsToDefine
                            };
                        }

                        return { "modifiedSourceCode": Buffer.from(fixedCssCode, "utf8") };
                    }

                    if (/\.js?$/i.test(filePath)) {
                        const { fixedJsCode } = replaceImportsFromStaticInJsCode({
                            "jsCode": sourceCode.toString("utf8"),
                            "bundler": "vite"
                        });

                        return { "modifiedSourceCode": Buffer.from(fixedJsCode, "utf8") };
                    }

                    return { "modifiedSourceCode": sourceCode };
                }
            });
        }

        const generateFtlFilesCode =
            generateFtlFilesCode_glob !== undefined
                ? generateFtlFilesCode_glob
                : generateFtlFilesCodeFactory({
                      themeName,
                      "indexHtmlCode": fs.readFileSync(pathJoin(buildOptions.reactAppBuildDirPath, "index.html")).toString("utf8"),
                      "cssGlobalsToDefine": allCssGlobalsToDefine,
                      buildOptions,
                      keycloakifyVersion,
                      themeType,
                      "fieldNames": readFieldNameUsage({
                          keycloakifySrcDirPath,
                          themeSrcDirPath,
                          themeType
                      })
                  }).generateFtlFilesCode;

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

            fs.mkdirSync(themeTypeDirPath, { "recursive": true });

            fs.writeFileSync(pathJoin(themeTypeDirPath, pageId), Buffer.from(ftlCode, "utf8"));
        });

        generateMessageProperties({
            themeSrcDirPath,
            themeType
        }).forEach(({ languageTag, propertiesFileSource }) => {
            const messagesDirPath = pathJoin(themeTypeDirPath, "messages");

            fs.mkdirSync(pathJoin(themeTypeDirPath, "messages"), { "recursive": true });

            const propertiesFilePath = pathJoin(messagesDirPath, `messages_${languageTag}.properties`);

            fs.writeFileSync(propertiesFilePath, Buffer.from(propertiesFileSource, "utf8"));
        });

        await downloadKeycloakStaticResources({
            "keycloakVersion": (() => {
                switch (themeType) {
                    case "account":
                        return lastKeycloakVersionWithAccountV1;
                    case "login":
                        return buildOptions.loginThemeResourcesFromKeycloakVersion;
                }
            })(),
            "themeDirPath": pathResolve(pathJoin(themeTypeDirPath, "..")),
            themeType,
            "usedResources": readStaticResourcesUsage({
                keycloakifySrcDirPath,
                themeSrcDirPath,
                themeType
            }),
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
                    ...(buildOptions.extraThemeProperties ?? [])
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

        transformCodebase({
            "srcDirPath": emailThemeSrcDirPath,
            "destDirPath": getThemeTypeDirPath({ "themeType": "email" })
        });
    }
}
