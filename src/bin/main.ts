
import { transformCodebase } from "../tools/transformCodebase";
import * as fs from "fs";
import { join as pathJoin } from "path";
import { assert } from "evt/tools/typeSafety/assert";
import {
    replaceImportFromStaticInCssCode,
    replaceImportFromStaticInJsCode
} from "./replaceImportFromStatic";
import { generateFtlFilesCodeFactory } from "./generateFtl";


const reactAppBuildDirPath = pathJoin(__dirname, "build");

assert(
    fs.existsSync(reactAppBuildDirPath),
    "Run 'react-script build' first (the build dir should be present)"
);

const keycloakDir = pathJoin(reactAppBuildDirPath, "..", "keycloak_build");

let allCssGlobalsToDefine: Record<string, string> = {};

const ftlValuesGlobalName = "keycloakFtlValues";


transformCodebase({
    "destDirPath": pathJoin(keycloakDir, "login", "resources"),
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
        pathJoin(keycloakDir, "login", pageBasename),
        Buffer.from(ftlCode, "utf8")
    )

});
