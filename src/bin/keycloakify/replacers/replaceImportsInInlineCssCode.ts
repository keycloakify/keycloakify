import type { BuildContext } from "../../shared/buildContext";
import { assert } from "tsafe/assert";
import { basenameOfTheKeycloakifyResourcesDir } from "../../shared/constants";

export type BuildContextLike = {
    urlPathname: string | undefined;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export function replaceImportsInInlineCssCode(params: {
    cssCode: string;
    buildContext: BuildContextLike;
}): {
    fixedCssCode: string;
} {
    const { cssCode, buildContext } = params;

    const fixedCssCode = cssCode.replace(
        buildContext.urlPathname === undefined
            ? /url\(["']?\/([^/][^)"']+)["']?\)/g
            : new RegExp(`url\\(["']?${buildContext.urlPathname}([^)"']+)["']?\\)`, "g"),
        (...[, group]) =>
            `url(\${url.resourcesPath}/${basenameOfTheKeycloakifyResourcesDir}/${group})`
    );

    return { fixedCssCode };
}
