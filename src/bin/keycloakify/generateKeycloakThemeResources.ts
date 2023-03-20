import { transformCodebase } from "../tools/transformCodebase";
import * as fs from "fs/promises";
import * as fsSync from "fs";
import { join as pathJoin, basename as pathBasename } from "path";
import { replaceImportsFromStaticInJsCode } from "./replacers/replaceImportsFromStaticInJsCode";
import { replaceImportsInCssCode } from "./replacers/replaceImportsInCssCode";
import { generateFtlFilesCodeFactory, pageIds } from "./generateFtl";
import { downloadBuiltinKeycloakTheme } from "../download-builtin-keycloak-theme";
import { mockTestingResourcesCommonPath, mockTestingResourcesPath, mockTestingSubDirOfPublicDirBasename } from "../mockTestingResourcesPath";
import { isInside } from "../tools/isInside";
import type { BuildOptions } from "./BuildOptions";
import { assert } from "tsafe/assert";
import { Reflect } from "tsafe/Reflect";
import { getLogger } from "../tools/logger";

export type BuildOptionsLike = BuildOptionsLike.Standalone | BuildOptionsLike.ExternalAssets;

export namespace BuildOptionsLike {
    export type Common = {
        themeName: string;
        extraPages?: string[];
        extraThemeProperties?: string[];
        isSilent: boolean;
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

{
    const buildOptions = Reflect<BuildOptions>();

    assert<typeof buildOptions extends BuildOptionsLike ? true : false>();
}

export async function generateKeycloakThemeResources(params: {
    reactAppBuildDirPath: string;
    keycloakThemeBuildingDirPath: string;
    keycloakThemeEmailDirPath: string;
    keycloakVersion: string;
    buildOptions: BuildOptionsLike;
}): Promise<{ doBundlesEmailTemplate: boolean }> {
    const { reactAppBuildDirPath, keycloakThemeBuildingDirPath, keycloakThemeEmailDirPath, keycloakVersion, buildOptions } = params;

    const logger = getLogger({ isSilent: buildOptions.isSilent });
    const themeDirPath = pathJoin(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme", buildOptions.themeName, "login");

    let allCssGlobalsToDefine: Record<string, string> = {};

    const mainPromises: Promise<void>[] = [];

    logger.log("transformCodebase");

    mainPromises.push(
        transformCodebase({
            "destDirPath": buildOptions.isStandalone ? pathJoin(themeDirPath, "resources", "build") : reactAppBuildDirPath,
            "srcDirPath": reactAppBuildDirPath,
            "transformSourceCode": ({ filePath, sourceCode }) => {
                //NOTE: Prevent cycles, excludes the folder we generated for debug in public/
                if (
                    buildOptions.isStandalone &&
                    isInside({
                        "dirPath": pathJoin(reactAppBuildDirPath, mockTestingSubDirOfPublicDirBasename),
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

                    allCssGlobalsToDefine = {
                        ...allCssGlobalsToDefine,
                        ...cssGlobalsToDefine
                    };

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
        })
    );

    let doBundlesEmailTemplate: boolean;

    email: {
        if (!fsSync.existsSync(keycloakThemeEmailDirPath)) {
            logger.log(
                [
                    `Not bundling email template because ${pathBasename(keycloakThemeEmailDirPath)} does not exist`,
                    `To start customizing the email template, run: 👉 npx create-keycloak-email-directory 👈`
                ].join("\n")
            );
            doBundlesEmailTemplate = false;
            break email;
        }

        doBundlesEmailTemplate = true;

        mainPromises.push(
            transformCodebase({
                "srcDirPath": keycloakThemeEmailDirPath,
                "destDirPath": pathJoin(themeDirPath, "..", "email")
            })
        );
    }

    const { generateFtlFilesCode } = await generateFtlFilesCodeFactory({
        "indexHtmlCode": (await fs.readFile(pathJoin(reactAppBuildDirPath, "index.html"))).toString("utf8"),
        "cssGlobalsToDefine": allCssGlobalsToDefine,
        "buildOptions": buildOptions
    });

    mainPromises.push(
        Promise.all(
            [...pageIds, ...(buildOptions.extraPages ?? [])].map(async pageId => {
                const { ftlCode } = generateFtlFilesCode({ pageId });

                await fs.mkdir(themeDirPath, { "recursive": true });

                await fs.writeFile(pathJoin(themeDirPath, pageId), Buffer.from(ftlCode, "utf8"));
            })
        ).then(() => {})
    );

    mainPromises.push(
        (async () => {
            const tmpDirPath = pathJoin(themeDirPath, "..", "tmp_xxKdLpdIdLd");

            await downloadBuiltinKeycloakTheme({
                keycloakVersion,
                "destDirPath": tmpDirPath,
                isSilent: buildOptions.isSilent
            });

            const themePromises: Promise<void>[] = [];

            const themeResourcesDirPath = pathJoin(themeDirPath, "resources");

            themePromises.push(
                transformCodebase({
                    "srcDirPath": pathJoin(tmpDirPath, "keycloak", "login", "resources"),
                    "destDirPath": themeResourcesDirPath
                })
            );

            const reactAppPublicDirPath = pathJoin(reactAppBuildDirPath, "..", "public");

            themePromises.push(
                transformCodebase({
                    "srcDirPath": pathJoin(tmpDirPath, "keycloak", "common", "resources"),
                    "destDirPath": pathJoin(themeResourcesDirPath, pathBasename(mockTestingResourcesCommonPath))
                })
            );

            themePromises.push(
                transformCodebase({
                    "srcDirPath": themeResourcesDirPath,
                    "destDirPath": pathJoin(reactAppPublicDirPath, mockTestingResourcesPath)
                })
            );

            const keycloakResourcesWithinPublicDirPath = pathJoin(reactAppPublicDirPath, mockTestingSubDirOfPublicDirBasename);

            await Promise.all(themePromises);

            await fs.writeFile(
                pathJoin(keycloakResourcesWithinPublicDirPath, "README.txt"),
                Buffer.from(
                    ["This is just a test folder that helps develop", "the login and register page without having to run a Keycloak container"].join(
                        " "
                    )
                )
            );

            await fs.writeFile(pathJoin(keycloakResourcesWithinPublicDirPath, ".gitignore"), Buffer.from("*", "utf8"));
            await fs.rm(tmpDirPath, { recursive: true, force: true });
        })()
    );

    await Promise.all(mainPromises);

    await fs.writeFile(
        pathJoin(themeDirPath, "theme.properties"),
        Buffer.from(["parent=keycloak", ...(buildOptions.extraThemeProperties ?? [])].join("\n\n"), "utf8")
    );

    return { doBundlesEmailTemplate };
}
