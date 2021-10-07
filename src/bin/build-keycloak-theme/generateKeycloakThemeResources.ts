
import { transformCodebase } from "../tools/transformCodebase";
import * as fs from "fs";
import { join as pathJoin } from "path";
import {
    replaceImportsInCssCode,
    replaceImportsFromStaticInJsCode
} from "./replaceImportFromStatic";
import { generateFtlFilesCodeFactory, pageIds } from "./generateFtl";
import { downloadBuiltinKeycloakTheme } from "../install-builtin-keycloak-themes";
import * as child_process from "child_process";
import { resourcesCommonPath, resourcesPath, subDirOfPublicDirBasename } from "../../lib/getKcContext/kcContextMocks/urlResourcesPath";
import { isInside } from "../tools/isInside";


export function generateKeycloakThemeResources(
    params: {
        themeName: string;
        reactAppBuildDirPath: string;
        keycloakThemeBuildingDirPath: string;
        urlPathname: string;
        //If urlOrigin is not undefined then it means --externals-assets
        urlOrigin: undefined | string;
        extraPagesId: string[];
        extraThemeProperties: string[];
        keycloakVersion: "11.0.3" | "15.0.2"
    }
) {

    const { 
        themeName, reactAppBuildDirPath, keycloakThemeBuildingDirPath, 
        urlPathname, urlOrigin, extraPagesId, extraThemeProperties,
        keycloakVersion
    } = params;

    const themeDirPath = pathJoin(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme", themeName, "login");

    let allCssGlobalsToDefine: Record<string, string> = {};

    transformCodebase({
        "destDirPath":
            urlOrigin === undefined ?
                pathJoin(themeDirPath, "resources", "build") :
                reactAppBuildDirPath,
        "srcDirPath": reactAppBuildDirPath,
        "transformSourceCode": ({ filePath, sourceCode }) => {

            //NOTE: Prevent cycles, excludes the folder we generated for debug in public/
            if (
                urlOrigin === undefined &&
                isInside({
                    "dirPath": pathJoin(reactAppBuildDirPath, subDirOfPublicDirBasename),
                    filePath
                })
            ) {
                return undefined;
            }

            if (urlOrigin === undefined && /\.css?$/i.test(filePath)) {

                const { cssGlobalsToDefine, fixedCssCode } = replaceImportsInCssCode(
                    { "cssCode": sourceCode.toString("utf8") }
                );

                allCssGlobalsToDefine = {
                    ...allCssGlobalsToDefine,
                    ...cssGlobalsToDefine
                };

                return { "modifiedSourceCode": Buffer.from(fixedCssCode, "utf8") };

            }

            if (/\.js?$/i.test(filePath)) {

                const { fixedJsCode } = replaceImportsFromStaticInJsCode({
                    "jsCode": sourceCode.toString("utf8"),
                    urlOrigin
                });

                return { "modifiedSourceCode": Buffer.from(fixedJsCode, "utf8") };

            }

            return urlOrigin === undefined ? 
                { "modifiedSourceCode": sourceCode } :
                undefined;

        }
    });

    const { generateFtlFilesCode } = generateFtlFilesCodeFactory({
        "cssGlobalsToDefine": allCssGlobalsToDefine,
        "indexHtmlCode": fs.readFileSync(
            pathJoin(reactAppBuildDirPath, "index.html")
        ).toString("utf8"),
        urlPathname,
        urlOrigin
    });

    [...pageIds, ...extraPagesId].forEach(pageId => {

        const { ftlCode } = generateFtlFilesCode({ pageId });

        fs.mkdirSync(themeDirPath, { "recursive": true });

        fs.writeFileSync(
            pathJoin(themeDirPath, pageId),
            Buffer.from(ftlCode, "utf8")
        );

    });

    {

        const tmpDirPath = pathJoin(themeDirPath, "..", "tmp_xxKdLpdIdLd");

        downloadBuiltinKeycloakTheme({
            keycloakVersion,
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
        Buffer.from(
            "parent=keycloak".concat("\n\n", extraThemeProperties.join("\n\n")),
            "utf8"
        )
    );

}

