import { basenameOfTheKeycloakifyResourcesDir } from "../../../shared/constants";
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

export function replaceImportsInJsCode_webpack(params: {
    jsCode: string;
    buildContext: BuildContextLike;
    systemType?: "posix" | "win32";
}): {
    fixedJsCode: string;
} {
    const {
        jsCode,
        buildContext,
        systemType = nodePath.sep === "/" ? "posix" : "win32"
    } = params;

    const { relative: pathRelative, sep: pathSep } = nodePath[systemType];

    let fixedJsCode = jsCode;

    if (buildContext.urlPathname !== undefined) {
        // "__esModule",{value:!0})},n.p="/foo-bar/",function(){if("undefined"  -> ... n.p="/" ...
        fixedJsCode = fixedJsCode.replace(
            new RegExp(
                `,([a-zA-Z]\\.[a-zA-Z])="${replaceAll(
                    buildContext.urlPathname,
                    "/",
                    "\\/"
                )}",`,
                "g"
            ),
            (...[, assignTo]) => `,${assignTo}="/",`
        );
    }

    // Example: "static/ or "foo/bar/"
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

    const getReplaceArgs = (
        language: "js" | "css"
    ): Parameters<typeof String.prototype.replace> => [
        new RegExp(
            `([a-zA-Z_]+)\\.([a-zA-Z]+)=(function\\(([a-z]+)\\){return|([a-z]+)=>)"${staticDir.replace(
                /\//g,
                "\\/"
            )}${language}\\/"`,
            "g"
        ),
        (...[, n, u, matchedFunction, eForFunction]) => {
            const isArrowFunction = matchedFunction.includes("=>");
            const e = isArrowFunction
                ? matchedFunction.replace("=>", "").trim()
                : eForFunction;

            return `
            ${n}[(function(){
                var pd = Object.getOwnPropertyDescriptor(${n}, "p");
                if( pd === undefined || pd.configurable ){
                    Object.defineProperty(${n}, "p", {
                        get: function() { return window.kcContext["x-keycloakify"].resourcesPath; },
                        set: function() {}
                    });
                }
                return "${u}";
            })()] = ${
                isArrowFunction ? `${e} =>` : `function(${e}) { return `
            } "/${basenameOfTheKeycloakifyResourcesDir}/${staticDir}${language}/"`
                .replace(/\s+/g, " ")
                .trim();
        }
    ];

    fixedJsCode = fixedJsCode
        .replace(...getReplaceArgs("js"))
        .replace(...getReplaceArgs("css"))
        .replace(
            new RegExp(
                `[a-zA-Z]+\\.[a-zA-Z]+\\+"${staticDir.replace(/\//g, "\\/")}`,
                "g"
            ),
            `window.kcContext["x-keycloakify"].resourcesPath + "/${basenameOfTheKeycloakifyResourcesDir}/${staticDir}`
        );

    return { fixedJsCode };
}
