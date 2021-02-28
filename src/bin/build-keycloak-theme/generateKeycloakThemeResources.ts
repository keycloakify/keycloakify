
import { transformCodebase } from "../tools/transformCodebase";
import * as fs from "fs";
import { join as pathJoin } from "path";
import {
    replaceImportFromStaticInCssCode,
    replaceImportFromStaticInJsCode
} from "./replaceImportFromStatic";
import { generateFtlFilesCodeFactory } from "./generateFtl";

export const ftlValuesGlobalName = "keycloakPagesContext";

export function generateKeycloakThemeResources(
    params: {
        themeName: string;
        reactAppBuildDirPath: string;
        keycloakThemeBuildingDirPath: string;
    }
) {

    const { themeName, reactAppBuildDirPath, keycloakThemeBuildingDirPath } = params;

    const themeDirPath = pathJoin(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme", themeName, "login");

    let allCssGlobalsToDefine: Record<string, string> = {};

    transformCodebase({
        "destDirPath": pathJoin(themeDirPath, "resources"),
        "srcDirPath": reactAppBuildDirPath,
        "transformSourceCodeString": ({ filePath, sourceCode }) => {

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
        ).toString("utf8")
    });

    (["login.ftl", "register.ftl"] as const).forEach(pageBasename => {

        const { ftlCode } = generateFtlFilesCode({ pageBasename });

        fs.writeFileSync(
            pathJoin(themeDirPath, pageBasename),
            Buffer.from(ftlCode, "utf8")
        )

    });

    fs.writeFileSync(
        pathJoin(themeDirPath, "theme.properties"),
        Buffer.from("parent=base\n", "utf8")
    );

}

