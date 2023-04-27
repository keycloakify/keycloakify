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

export type BuildOptionsLike = BuildOptionsLike.Standalone | BuildOptionsLike.ExternalAssets;

export namespace BuildOptionsLike {
    export type Common = {
        themeName: string;
        extraLoginPages?: string[];
        extraAccountPages?: string[];
        extraThemeProperties?: string[];
        isSilent: boolean;
        customUserAttributes: string[];
        themeVersion: string;
        keycloakVersionDefaultAssets: string;
    };

    export type Standalone = Common & {
        isStandalone: true;
        urlPathname: string | undefined;
    };

    export type ExternalAssets = ExternalAssets.SameDomain | ExternalAssets.DifferentDomains;

    export namespace ExternalAssets {
        export type CommonExternalAssets = Common & {
            isStandalone: false;
        };

        export type SameDomain = CommonExternalAssets & {
            areAppAndKeycloakServerSharingSameDomain: true;
        };

        export type DifferentDomains = CommonExternalAssets & {
            areAppAndKeycloakServerSharingSameDomain: false;
            urlOrigin: string;
            urlPathname: string | undefined;
        };
    }
}

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export async function generateTheme(params: {
    reactAppBuildDirPath: string;
    keycloakThemeBuildingDirPath: string;
    emailThemeSrcDirPath: string | undefined;
    buildOptions: BuildOptionsLike;
    keycloakifyVersion: string;
}): Promise<{ doBundlesEmailTemplate: boolean }> {
    const { reactAppBuildDirPath, keycloakThemeBuildingDirPath, emailThemeSrcDirPath, buildOptions, keycloakifyVersion } = params;

    const getThemeDirPath = (themeType: ThemeType | "email") =>
        pathJoin(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme", buildOptions.themeName, themeType);

    let allCssGlobalsToDefine: Record<string, string> = {};

    let generateFtlFilesCode_glob: ReturnType<typeof generateFtlFilesCodeFactory>["generateFtlFilesCode"] | undefined = undefined;

    for (const themeType of themeTypes) {
        const themeDirPath = getThemeDirPath(themeType);

        copy_app_resources_to_theme_path: {
            const isFirstPass = themeType.indexOf(themeType) === 0;

            if (!isFirstPass && !buildOptions.isStandalone) {
                break copy_app_resources_to_theme_path;
            }

            transformCodebase({
                "destDirPath": buildOptions.isStandalone ? pathJoin(themeDirPath, "resources", "build") : reactAppBuildDirPath,
                "srcDirPath": reactAppBuildDirPath,
                "transformSourceCode": ({ filePath, sourceCode }) => {
                    //NOTE: Prevent cycles, excludes the folder we generated for debug in public/
                    if (
                        buildOptions.isStandalone &&
                        isInside({
                            "dirPath": pathJoin(reactAppBuildDirPath, basenameOfKeycloakDirInPublicDir),
                            filePath
                        })
                    ) {
                        return undefined;
                    }

                    if (/\.css?$/i.test(filePath)) {
                        if (!buildOptions.isStandalone) {
                            return undefined;
                        }

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
                        if (!buildOptions.isStandalone && buildOptions.areAppAndKeycloakServerSharingSameDomain) {
                            return undefined;
                        }

                        const { fixedJsCode } = replaceImportsFromStaticInJsCode({
                            "jsCode": sourceCode.toString("utf8"),
                            buildOptions
                        });

                        return { "modifiedSourceCode": Buffer.from(fixedJsCode, "utf8") };
                    }

                    return buildOptions.isStandalone ? { "modifiedSourceCode": sourceCode } : undefined;
                }
            });
        }

        const generateFtlFilesCode = (() => {
            if (generateFtlFilesCode_glob !== undefined) {
                return generateFtlFilesCode_glob;
            }

            const { generateFtlFilesCode } = generateFtlFilesCodeFactory({
                "indexHtmlCode": fs.readFileSync(pathJoin(reactAppBuildDirPath, "index.html")).toString("utf8"),
                "cssGlobalsToDefine": allCssGlobalsToDefine,
                buildOptions,
                keycloakifyVersion,
                themeType
            });

            return generateFtlFilesCode;
        })();

        [
            ...(() => {
                switch (themeType) {
                    case "login":
                        return loginThemePageIds;
                    case "account":
                        return accountThemePageIds;
                }
            })(),
            ...((() => {
                switch (themeType) {
                    case "login":
                        return buildOptions.extraLoginPages;
                    case "account":
                        return buildOptions.extraAccountPages;
                }
            })() ?? [])
        ].forEach(pageId => {
            const { ftlCode } = generateFtlFilesCode({ pageId });

            fs.mkdirSync(themeDirPath, { "recursive": true });

            fs.writeFileSync(pathJoin(themeDirPath, pageId), Buffer.from(ftlCode, "utf8"));
        });

        //TODO: Remove this block we left it for now only for backward compatibility
        // we now have a separate script for this
        copy_keycloak_resources_to_public: {
            const keycloakDirInPublicDir = pathJoin(reactAppBuildDirPath, "..", "public", basenameOfKeycloakDirInPublicDir);

            if (fs.existsSync(keycloakDirInPublicDir)) {
                break copy_keycloak_resources_to_public;
            }

            await downloadKeycloakStaticResources({
                "isSilent": buildOptions.isSilent,
                "keycloakVersion": buildOptions.keycloakVersionDefaultAssets,
                "themeDirPath": keycloakDirInPublicDir,
                themeType
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
            "isSilent": buildOptions.isSilent,
            "keycloakVersion": buildOptions.keycloakVersionDefaultAssets,
            themeDirPath,
            themeType
        });

        fs.writeFileSync(
            pathJoin(themeDirPath, "theme.properties"),
            Buffer.from(["parent=keycloak", ...(buildOptions.extraThemeProperties ?? [])].join("\n\n"), "utf8")
        );
    }

    let doBundlesEmailTemplate: boolean;

    email: {
        if (emailThemeSrcDirPath === undefined) {
            doBundlesEmailTemplate = false;
            break email;
        }

        doBundlesEmailTemplate = true;

        transformCodebase({
            "srcDirPath": emailThemeSrcDirPath,
            "destDirPath": getThemeDirPath("email")
        });
    }

    return { doBundlesEmailTemplate };
}
