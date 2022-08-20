import type { BuildOptions } from "../BuildOptions";
import { assert } from "tsafe/assert";
import { is } from "tsafe/is";
import { Reflect } from "tsafe/Reflect";

export type BuildOptionsLike = BuildOptionsLike.Standalone | BuildOptionsLike.ExternalAssets;

export namespace BuildOptionsLike {
    export type Common = {
        urlPathname: string | undefined;
    };

    export type Standalone = Common & {
        isStandalone: true;
    };

    export type ExternalAssets = Common & {
        isStandalone: false;
        urlOrigin: string;
    };
}

{
    const buildOptions = Reflect<BuildOptions>();

    assert(!is<BuildOptions.ExternalAssets.CommonExternalAssets>(buildOptions));

    assert<typeof buildOptions extends BuildOptionsLike ? true : false>();
}

export function replaceImportsInInlineCssCode(params: { cssCode: string; buildOptions: BuildOptionsLike }): {
    fixedCssCode: string;
} {
    const { cssCode, buildOptions } = params;

    const fixedCssCode = cssCode.replace(
        buildOptions.urlPathname === undefined
            ? /url\(["']?\/([^/][^)"']+)["']?\)/g
            : new RegExp(`url\\(["']?${buildOptions.urlPathname}([^)"']+)["']?\\)`, "g"),
        (...[, group]) =>
            `url(${
                buildOptions.isStandalone ? "${url.resourcesPath}/build/" + group : buildOptions.urlOrigin + (buildOptions.urlPathname ?? "/") + group
            })`
    );

    return { fixedCssCode };
}
