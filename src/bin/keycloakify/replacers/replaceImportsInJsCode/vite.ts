import {
    nameOfTheGlobal,
    basenameOfTheKeycloakifyResourcesDir
} from "../../../shared/constants";
import { assert } from "tsafe/assert";
import type { BuildContext } from "../../../shared/buildContext";
import * as nodePath from "path";
import { replaceAll } from "../../../tools/String.prototype.replaceAll";

export type BuildContextLike = {
    projectBuildDirPath: string;
    assetsDirPath: string;
    urlPathname: string | undefined;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export function replaceImportsInJsCode_vite(params: {
    jsCode: string;
    buildContext: BuildContextLike;
    basenameOfAssetsFiles: string[];
    systemType?: "posix" | "win32";
}): {
    fixedJsCode: string;
} {
    const {
        jsCode,
        buildContext,
        basenameOfAssetsFiles,
        systemType = nodePath.sep === "/" ? "posix" : "win32"
    } = params;

    const { relative: pathRelative, sep: pathSep } = nodePath[systemType];

    let fixedJsCode = jsCode;

    replace_base_javacript_import: {
        if (buildContext.urlPathname === undefined) {
            break replace_base_javacript_import;
        }
        // Optimization
        if (!jsCode.includes(buildContext.urlPathname)) {
            break replace_base_javacript_import;
        }

        // Replace `Hv=function(e){return"/abcde12345/"+e}` by `Hv=function(e){return"/"+e}`
        fixedJsCode = fixedJsCode.replace(
            new RegExp(
                `([\\w\\$][\\w\\d\\$]*)=function\\(([\\w\\$][\\w\\d\\$]*)\\)\\{return"${replaceAll(
                    buildContext.urlPathname,
                    "/",
                    "\\/"
                )}"\\+\\2\\}`,
                "g"
            ),
            (...[, funcName, paramName]) =>
                `${funcName}=function(${paramName}){return"/"+${paramName}}`
        );
    }

    replace_javascript_relatives_import_paths: {
        // Example: "assets/ or "foo/bar/"
        const staticDir = (() => {
            let out = pathRelative(
                buildContext.projectBuildDirPath,
                buildContext.assetsDirPath
            );

            out = replaceAll(out, pathSep, "/") + "/";

            if (out === "/") {
                throw new Error(
                    `The assetsDirPath must be a subdirectory of projectBuildDirPath`
                );
            }

            return out;
        })();

        // Optimization
        if (!jsCode.includes(staticDir)) {
            break replace_javascript_relatives_import_paths;
        }

        basenameOfAssetsFiles
            .map(basenameOfAssetsFile => `${staticDir}${basenameOfAssetsFile}`)
            .forEach(relativePathOfAssetFile => {
                fixedJsCode = replaceAll(
                    fixedJsCode,
                    `"${relativePathOfAssetFile}"`,
                    `(window.${nameOfTheGlobal}.url.resourcesPath.substring(1) + "/${basenameOfTheKeycloakifyResourcesDir}/${relativePathOfAssetFile}")`
                );

                fixedJsCode = replaceAll(
                    fixedJsCode,
                    `"${buildContext.urlPathname ?? "/"}${relativePathOfAssetFile}"`,
                    `(window.${nameOfTheGlobal}.url.resourcesPath + "/${basenameOfTheKeycloakifyResourcesDir}/${relativePathOfAssetFile}")`
                );
            });
    }

    return { fixedJsCode };
}
