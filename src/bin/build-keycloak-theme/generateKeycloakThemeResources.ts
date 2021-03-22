
import { transformCodebase } from "../tools/transformCodebase";
import * as fs from "fs";
import { join as pathJoin } from "path";
import {
    replaceImportFromStaticInCssCode,
    replaceImportFromStaticInJsCode
} from "./replaceImportFromStatic";
import { generateFtlFilesCodeFactory, pageIds } from "./generateFtl";
import { builtinThemesUrl } from "../install-builtin-keycloak-themes";
import { downloadAndUnzip } from "../tools/downloadAndUnzip";
import * as child_process from "child_process";
import { ftlValuesGlobalName } from "./ftlValuesGlobalName";
import { resourcesCommonPath, resourcesPath, subDirOfPublicDirBasename } from "../../lib/kcContextMocks/urlResourcesPath";
import { isInside } from "../tools/isInside";

export function generateKeycloakThemeResources(
    params: {
        urlPathname: string;
        themeName: string;
        reactAppBuildDirPath: string;
        keycloakThemeBuildingDirPath: string;
    }
) {

    const { themeName, reactAppBuildDirPath, keycloakThemeBuildingDirPath, urlPathname } = params;

    const themeDirPath = pathJoin(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme", themeName, "login");

    let allCssGlobalsToDefine: Record<string, string> = {};

    transformCodebase({
        "destDirPath": pathJoin(themeDirPath, "resources", "build"),
        "srcDirPath": reactAppBuildDirPath,
        "transformSourceCode": ({ filePath, sourceCode }) => {

            //NOTE: Prevent cycles, excludes the folder we generated for debug in public/
            if (
                isInside({
                    "dirPath": pathJoin(reactAppBuildDirPath, subDirOfPublicDirBasename),
                    filePath
                })
            ) {
                return undefined;
            }


            if (/\.css?$/i.test(filePath)) {

                const { cssGlobalsToDefine, fixedCssCode } = replaceImportFromStaticInCssCode(
                    { "cssCode": sourceCode.toString("utf8") }
                );

                allCssGlobalsToDefine = {
                    ...allCssGlobalsToDefine,
                    ...cssGlobalsToDefine
                };

                return { "modifiedSourceCode": Buffer.from(fixedCssCode, "utf8") };

            }

            if (/\.js?$/i.test(filePath)) {

                const { fixedJsCode } = replaceImportFromStaticInJsCode({
                    "jsCode": sourceCode.toString("utf8"),
                    ftlValuesGlobalName
                });

                return { "modifiedSourceCode": Buffer.from(fixedJsCode, "utf8") };

            }

            return { "modifiedSourceCode": sourceCode };

        }
    });

    const { generateFtlFilesCode } = generateFtlFilesCodeFactory({
        "cssGlobalsToDefine": allCssGlobalsToDefine,
        ftlValuesGlobalName,
        "indexHtmlCode": fs.readFileSync(
            pathJoin(reactAppBuildDirPath, "index.html")
        ).toString("utf8"),
        urlPathname
    });

    pageIds.forEach(pageId => {

        const { ftlCode } = generateFtlFilesCode({ pageId });

        fs.writeFileSync(
            pathJoin(themeDirPath, pageId),
            Buffer.from(ftlCode, "utf8")
        );

    });

    {

        const tmpDirPath = pathJoin(themeDirPath, "..", "tmp_xxKdLpdIdLd");

        downloadAndUnzip({
            "url": builtinThemesUrl,
            "destDirPath": tmpDirPath
        });

        const themeResourcesDirPath = pathJoin(themeDirPath, "resources");

        transformCodebase({
            "srcDirPath": pathJoin(tmpDirPath, "keycloak", "login", "resources"),
            "destDirPath": themeResourcesDirPath
        });

        const reactAppPublicDirPath = pathJoin(reactAppBuildDirPath, "..", "public");

        transformCodebase({
            "srcDirPath": themeResourcesDirPath,
            "destDirPath": pathJoin(
                reactAppPublicDirPath,
                resourcesPath
            )
        });

        transformCodebase({
            "srcDirPath": pathJoin(tmpDirPath, "keycloak", "common", "resources"),
            "destDirPath": pathJoin(
                reactAppPublicDirPath,
                resourcesCommonPath
            )
        });

        const keycloakResourcesWithinPublicDirPath =
            pathJoin(reactAppPublicDirPath, subDirOfPublicDirBasename);


        fs.writeFileSync(
            pathJoin(keycloakResourcesWithinPublicDirPath, "README.txt"),
            Buffer.from([
                "This is just a test folder that helps develop",
                "the login and register page without having to yarn build"
            ].join(" "))
        );

        fs.writeFileSync(
            pathJoin(keycloakResourcesWithinPublicDirPath, ".gitignore"),
            Buffer.from("*", "utf8")
        );

        child_process.execSync(`rm -r ${tmpDirPath}`);

    }

    fs.writeFileSync(
        pathJoin(themeDirPath, "theme.properties"),
        Buffer.from("parent=keycloak", "utf8")
    );

}

