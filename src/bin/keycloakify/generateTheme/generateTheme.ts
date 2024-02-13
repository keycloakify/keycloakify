import { transformCodebase } from "../../tools/transformCodebase";
import * as fs from "fs";
import { join as pathJoin, basename as pathBasename, resolve as pathResolve, dirname as pathDirname } from "path";
import { replaceImportsInJsCode } from "../replacers/replaceImportsInJsCode";
import { replaceImportsInCssCode } from "../replacers/replaceImportsInCssCode";
import { generateFtlFilesCodeFactory, loginThemePageIds, accountThemePageIds } from "../generateFtl";
import {
    type ThemeType,
    lastKeycloakVersionWithAccountV1,
    keycloak_resources,
    retrocompatPostfix,
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
import { bringInAccountV1 } from "./bringInAccountV1";
import { rmSync } from "../../tools/fs.rmSync";

export type BuildOptionsLike = {
    bundler: "vite" | "webpack";
    extraThemeProperties: string[] | undefined;
    themeVersion: string;
    loginThemeResourcesFromKeycloakVersion: string;
    keycloakifyBuildDirPath: string;
    reactAppBuildDirPath: string;
    cacheDirPath: string;
    assetsDirPath: string;
    urlPathname: string | undefined;
    doBuildRetrocompatAccountTheme: boolean;
    themeNames: string[];
    npmWorkspaceRootDirPath: string;
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

    const getThemeTypeDirPath = (params: { themeType: ThemeType | "email"; isRetrocompat?: true }) => {
        const { themeType, isRetrocompat = false } = params;
        return pathJoin(
            buildOptions.keycloakifyBuildDirPath,
            "src",
            "main",
            "resources",
            "theme",
            `${themeName}${isRetrocompat ? retrocompatPostfix : ""}`,
            themeType
        );
    };

    const cssGlobalsToDefine: Record<string, string> = {};

    const implementedThemeTypes: Record<ThemeType | "email", boolean> = {
        "login": false,
        "account": false,
        "email": false
    };

    for (const themeType of ["login", "account"] as const) {
        if (!fs.existsSync(pathJoin(themeSrcDirPath, themeType))) {
            continue;
        }

        implementedThemeTypes[themeType] = true;

        const themeTypeDirPath = getThemeTypeDirPath({ themeType });

        apply_replacers_and_move_to_theme_resources: {
            const destDirPath = pathJoin(themeTypeDirPath, "resources", basenameOfTheKeycloakifyResourcesDir);

            // NOTE: Prevent accumulation of files in the assets dir, as names are hashed they pile up.
            rmSync(destDirPath, { "recursive": true, "force": true });

            if (themeType === "account" && implementedThemeTypes.login) {
                // NOTE: We prevend doing it twice, it has been done for the login theme.

                transformCodebase({
                    "srcDirPath": pathJoin(
                        getThemeTypeDirPath({
                            "themeType": "login"
                        }),
                        "resources",
                        basenameOfTheKeycloakifyResourcesDir
                    ),
                    destDirPath
                });

                break apply_replacers_and_move_to_theme_resources;
            }

            transformCodebase({
                "srcDirPath": buildOptions.reactAppBuildDirPath,
                destDirPath,
                "transformSourceCode": ({ filePath, sourceCode }) => {
                    //NOTE: Prevent cycles, excludes the folder we generated for debug in public/
                    // This should not happen if users follow the new instruction setup but we keep it for retrocompatibility.
                    if (
                        isInside({
                            "dirPath": pathJoin(buildOptions.reactAppBuildDirPath, keycloak_resources),
                            filePath
                        })
                    ) {
                        return undefined;
                    }

                    if (/\.css?$/i.test(filePath)) {
                        const { cssGlobalsToDefine: cssGlobalsToDefineForThisFile, fixedCssCode } = replaceImportsInCssCode({
                            "cssCode": sourceCode.toString("utf8")
                        });

                        Object.entries(cssGlobalsToDefineForThisFile).forEach(([key, value]) => {
                            cssGlobalsToDefine[key] = value;
                        });

                        return { "modifiedSourceCode": Buffer.from(fixedCssCode, "utf8") };
                    }

                    if (/\.js?$/i.test(filePath)) {
                        const { fixedJsCode } = replaceImportsInJsCode({
                            "jsCode": sourceCode.toString("utf8"),
                            buildOptions
                        });

                        return { "modifiedSourceCode": Buffer.from(fixedJsCode, "utf8") };
                    }

                    return { "modifiedSourceCode": sourceCode };
                }
            });
        }

        const { generateFtlFilesCode } = generateFtlFilesCodeFactory({
            themeName,
            "indexHtmlCode": fs.readFileSync(pathJoin(buildOptions.reactAppBuildDirPath, "index.html")).toString("utf8"),
            cssGlobalsToDefine,
            buildOptions,
            keycloakifyVersion,
            themeType,
            "fieldNames": readFieldNameUsage({
                keycloakifySrcDirPath,
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

        if (themeType === "account" && buildOptions.doBuildRetrocompatAccountTheme) {
            transformCodebase({
                "srcDirPath": themeTypeDirPath,
                "destDirPath": getThemeTypeDirPath({ themeType, "isRetrocompat": true }),
                "transformSourceCode": ({ filePath, sourceCode }) => {
                    if (pathBasename(filePath) === "theme.properties") {
                        return {
                            "modifiedSourceCode": Buffer.from(
                                sourceCode.toString("utf8").replace(`parent=${accountV1ThemeName}`, "parent=keycloak"),
                                "utf8"
                            )
                        };
                    }

                    return { "modifiedSourceCode": sourceCode };
                }
            });
        }
    }

    email: {
        const emailThemeSrcDirPath = pathJoin(themeSrcDirPath, "email");

        if (!fs.existsSync(emailThemeSrcDirPath)) {
            break email;
        }

        implementedThemeTypes.email = true;

        transformCodebase({
            "srcDirPath": emailThemeSrcDirPath,
            "destDirPath": getThemeTypeDirPath({ "themeType": "email" })
        });
    }

    const parsedKeycloakThemeJson: { themes: { name: string; types: string[] }[] } = { "themes": [] };

    buildOptions.themeNames.forEach(themeName =>
        parsedKeycloakThemeJson.themes.push({
            "name": themeName,
            "types": Object.entries(implementedThemeTypes)
                .filter(([, isImplemented]) => isImplemented)
                .map(([themeType]) => themeType)
        })
    );

    account_specific_extra_work: {
        if (!implementedThemeTypes.account) {
            break account_specific_extra_work;
        }

        await bringInAccountV1({ buildOptions });

        parsedKeycloakThemeJson.themes.push({
            "name": accountV1ThemeName,
            "types": ["account"]
        });

        add_retrocompat_account_theme: {
            if (!buildOptions.doBuildRetrocompatAccountTheme) {
                break add_retrocompat_account_theme;
            }

            transformCodebase({
                "srcDirPath": getThemeTypeDirPath({ "themeType": "account" }),
                "destDirPath": getThemeTypeDirPath({ "themeType": "account", "isRetrocompat": true }),
                "transformSourceCode": ({ filePath, sourceCode }) => {
                    if (pathBasename(filePath) === "theme.properties") {
                        return {
                            "modifiedSourceCode": Buffer.from(
                                sourceCode.toString("utf8").replace(`parent=${accountV1ThemeName}`, "parent=keycloak"),
                                "utf8"
                            )
                        };
                    }

                    return { "modifiedSourceCode": sourceCode };
                }
            });

            buildOptions.themeNames.forEach(themeName =>
                parsedKeycloakThemeJson.themes.push({
                    "name": `${themeName}${retrocompatPostfix}`,
                    "types": ["account"]
                })
            );
        }
    }

    {
        const keycloakThemeJsonFilePath = pathJoin(
            buildOptions.keycloakifyBuildDirPath,
            "src",
            "main",
            "resources",
            "META-INF",
            "keycloak-themes.json"
        );

        try {
            fs.mkdirSync(pathDirname(keycloakThemeJsonFilePath));
        } catch {}

        fs.writeFileSync(keycloakThemeJsonFilePath, Buffer.from(JSON.stringify(parsedKeycloakThemeJson, null, 2), "utf8"));
    }
}
