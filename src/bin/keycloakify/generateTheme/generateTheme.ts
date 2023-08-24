import { transformCodebase } from "../../tools/transformCodebase";
import * as fs from "fs";
import { join as pathJoin } from "path";
import { replaceImportsFromStaticInJsCode } from "../replacers/replaceImportsFromStaticInJsCode";
import { replaceImportsInCssCode } from "../replacers/replaceImportsInCssCode";
import { generateFtlFilesCodeFactory, loginThemePageIds, accountThemePageIds, themeTypes, type ThemeType } from "../generateFtl";
import { basenameOfKeycloakDirInPublicDir } from "../../mockTestingResourcesPath";
import { isInside } from "../../tools/isInside";
import type { BuildOptions } from "../BuildOptions";
import { assert } from "tsafe/assert";
import { downloadKeycloakStaticResources } from "./downloadKeycloakStaticResources";
import { readFieldNameUsage } from "./readFieldNameUsage";
import { readExtraPagesNames } from "./readExtraPageNames";
import { generateMessageProperties } from "./generateMessageProperties";
import { readStaticResourcesUsage } from "./readStaticResourcesUsage";

export type BuildOptionsLike = {
    themeName: string;
    extraThemeProperties: string[] | undefined;
    themeVersion: string;
    keycloakVersionDefaultAssets: string;
    urlPathname: string | undefined;
};

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export async function generateTheme(params: {
    projectDirPath: string;
    reactAppBuildDirPath: string;
    keycloakThemeBuildingDirPath: string;
    themeSrcDirPath: string;
    keycloakifySrcDirPath: string;
    buildOptions: BuildOptionsLike;
    keycloakifyVersion: string;
}): Promise<void> {
    const {
        projectDirPath,
        reactAppBuildDirPath,
        keycloakThemeBuildingDirPath,
        themeSrcDirPath,
        keycloakifySrcDirPath,
        buildOptions,
        keycloakifyVersion
    } = params;

    const getThemeDirPath = (themeType: ThemeType | "email") =>
        pathJoin(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme", buildOptions.themeName, themeType);

    let allCssGlobalsToDefine: Record<string, string> = {};

    let generateFtlFilesCode_glob: ReturnType<typeof generateFtlFilesCodeFactory>["generateFtlFilesCode"] | undefined = undefined;

    for (const themeType of themeTypes) {
        if (!fs.existsSync(pathJoin(themeSrcDirPath, themeType))) {
            continue;
        }

        const themeDirPath = getThemeDirPath(themeType);

        copy_app_resources_to_theme_path: {
            const isFirstPass = themeType.indexOf(themeType) === 0;

            if (!isFirstPass) {
                break copy_app_resources_to_theme_path;
            }

            transformCodebase({
                "destDirPath": pathJoin(themeDirPath, "resources", "build"),
                "srcDirPath": reactAppBuildDirPath,
                "transformSourceCode": ({ filePath, sourceCode }) => {
                    //NOTE: Prevent cycles, excludes the folder we generated for debug in public/
                    if (
                        isInside({
                            "dirPath": pathJoin(reactAppBuildDirPath, basenameOfKeycloakDirInPublicDir),
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
                            "jsCode": sourceCode.toString("utf8")
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
                      "indexHtmlCode": fs.readFileSync(pathJoin(reactAppBuildDirPath, "index.html")).toString("utf8"),
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

            fs.mkdirSync(themeDirPath, { "recursive": true });

            fs.writeFileSync(pathJoin(themeDirPath, pageId), Buffer.from(ftlCode, "utf8"));
        });

        generateMessageProperties({
            themeSrcDirPath,
            themeType
        }).forEach(({ languageTag, propertiesFileSource }) => {
            const messagesDirPath = pathJoin(themeDirPath, "messages");

            fs.mkdirSync(pathJoin(themeDirPath, "messages"), { "recursive": true });

            const propertiesFilePath = pathJoin(messagesDirPath, `messages_${languageTag}.properties`);

            fs.writeFileSync(propertiesFilePath, Buffer.from(propertiesFileSource, "utf8"));
        });

        //TODO: Remove this block we left it for now only for backward compatibility
        // we now have a separate script for this
        copy_keycloak_resources_to_public: {
            const keycloakDirInPublicDir = pathJoin(reactAppBuildDirPath, "..", "public", basenameOfKeycloakDirInPublicDir);

            if (fs.existsSync(keycloakDirInPublicDir)) {
                break copy_keycloak_resources_to_public;
            }

            await downloadKeycloakStaticResources({
                projectDirPath,
                "keycloakVersion": buildOptions.keycloakVersionDefaultAssets,
                "themeDirPath": keycloakDirInPublicDir,
                themeType,
                "usedResources": undefined
            });

            if (themeType !== themeTypes[0]) {
                break copy_keycloak_resources_to_public;
            }

            fs.writeFileSync(
                pathJoin(keycloakDirInPublicDir, "README.txt"),
                Buffer.from(
                    // prettier-ignore
                    [
                        "This is just a test folder that helps develop",
                        "the login and register page without having to run a Keycloak container"
                    ].join(" ")
                )
            );

            fs.writeFileSync(pathJoin(keycloakDirInPublicDir, ".gitignore"), Buffer.from("*", "utf8"));
        }

        await downloadKeycloakStaticResources({
            projectDirPath,
            "keycloakVersion": buildOptions.keycloakVersionDefaultAssets,
            themeDirPath,
            themeType,
            "usedResources": readStaticResourcesUsage({
                keycloakifySrcDirPath,
                themeSrcDirPath,
                themeType
            })
        });

        fs.writeFileSync(
            pathJoin(themeDirPath, "theme.properties"),
            Buffer.from([`parent=keycloak`, ...(buildOptions.extraThemeProperties ?? [])].join("\n\n"), "utf8")
        );
    }

    email: {
        const emailThemeSrcDirPath = pathJoin(themeSrcDirPath, "email");

        if (!fs.existsSync(emailThemeSrcDirPath)) {
            break email;
        }

        transformCodebase({
            "srcDirPath": emailThemeSrcDirPath,
            "destDirPath": getThemeDirPath("email")
        });
    }
}
