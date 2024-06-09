import { assert } from "tsafe/assert";
import type { BuildContext } from "../../../shared/buildContext";
import { replaceImportsInJsCode_vite } from "./vite";
import { replaceImportsInJsCode_webpack } from "./webpack";
import * as fs from "fs";

export type BuildContextLike = {
    projectBuildDirPath: string;
    assetsDirPath: string;
    urlPathname: string | undefined;
    bundler: "vite" | "webpack";
};

assert<BuildContext extends BuildContextLike ? true : false>();

export function replaceImportsInJsCode(params: {
    jsCode: string;
    buildContext: BuildContextLike;
}) {
    const { jsCode, buildContext } = params;

    const { fixedJsCode } = (() => {
        switch (buildContext.bundler) {
            case "vite":
                return replaceImportsInJsCode_vite({
                    jsCode,
                    buildContext,
                    basenameOfAssetsFiles: readAssetsDirSync({
                        assetsDirPath: params.buildContext.assetsDirPath
                    })
                });
            case "webpack":
                return replaceImportsInJsCode_webpack({
                    jsCode,
                    buildContext
                });
        }
    })();

    return { fixedJsCode };
}

const { readAssetsDirSync } = (() => {
    let cache:
        | {
              assetsDirPath: string;
              basenameOfAssetsFiles: string[];
          }
        | undefined = undefined;

    function readAssetsDirSync(params: { assetsDirPath: string }): string[] {
        const { assetsDirPath } = params;

        if (cache !== undefined && cache.assetsDirPath === assetsDirPath) {
            return cache.basenameOfAssetsFiles;
        }

        const basenameOfAssetsFiles = fs.readdirSync(assetsDirPath);

        cache = {
            assetsDirPath,
            basenameOfAssetsFiles
        };

        return basenameOfAssetsFiles;
    }

    return { readAssetsDirSync };
})();
