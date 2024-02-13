import { assert } from "tsafe/assert";
import type { BuildOptions } from "../../buildOptions";
import { replaceImportsInJsCode_vite } from "./vite";
import { replaceImportsInJsCode_webpack } from "./webpack";
import * as fs from "fs";

export type BuildOptionsLike = {
    reactAppBuildDirPath: string;
    assetsDirPath: string;
    urlPathname: string | undefined;
    bundler: "vite" | "webpack";
};

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export function replaceImportsInJsCode(params: { jsCode: string; buildOptions: BuildOptionsLike }) {
    const { jsCode, buildOptions } = params;

    const { fixedJsCode } = (() => {
        switch (buildOptions.bundler) {
            case "vite":
                return replaceImportsInJsCode_vite({
                    jsCode,
                    buildOptions,
                    "basenameOfAssetsFiles": readAssetsDirSync({
                        "assetsDirPath": params.buildOptions.assetsDirPath
                    })
                });
            case "webpack":
                return replaceImportsInJsCode_webpack({
                    jsCode,
                    buildOptions
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
