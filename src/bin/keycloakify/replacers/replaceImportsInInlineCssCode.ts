import type { BuildOptions } from "../buildOptions";
import { assert } from "tsafe/assert";
import { basenameOfTheKeycloakifyResourcesDir } from "../../constants";

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
        (...[, group]) => `url(\${url.resourcesPath}/${basenameOfTheKeycloakifyResourcesDir}/${group})`
    );

    return { fixedCssCode };
}
