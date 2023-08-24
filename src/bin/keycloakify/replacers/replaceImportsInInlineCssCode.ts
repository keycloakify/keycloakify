import type { BuildOptions } from "../BuildOptions";
import { assert } from "tsafe/assert";

export type BuildOptionsLike = {
    urlPathname: string | undefined;
};

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export function replaceImportsInInlineCssCode(params: { cssCode: string; buildOptions: BuildOptionsLike }): {
    fixedCssCode: string;
} {
    const { cssCode, buildOptions } = params;

    const fixedCssCode = cssCode.replace(
        buildOptions.urlPathname === undefined
            ? /url\(["']?\/([^/][^)"']+)["']?\)/g
            : new RegExp(`url\\(["']?${buildOptions.urlPathname}([^)"']+)["']?\\)`, "g"),
        (...[, group]) => `url(\${url.resourcesPath}/build/${group})`
    );

    return { fixedCssCode };
}
