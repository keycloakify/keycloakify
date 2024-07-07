import type { BuildContext } from "../../shared/buildContext";
import { basenameOfTheKeycloakifyResourcesDir } from "../../shared/constants";
import { assert } from "tsafe/assert";
import { posix } from "path";

export type BuildContextLike = {
    urlPathname: string | undefined;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export function replaceImportsInCssCode(params: {
    cssCode: string;
    cssFileRelativeDirPath: string | undefined;
    isAccountV3: boolean;
    buildContext: BuildContextLike;
}): {
    fixedCssCode: string;
} {
    const { cssCode, cssFileRelativeDirPath, buildContext, isAccountV3 } = params;

    const fixedCssCode = cssCode.replace(
        /url\(["']?(\/[^/][^)"']+)["']?\)/g,
        (match, assetFileAbsoluteUrlPathname) => {
            if (buildContext.urlPathname !== undefined) {
                if (!assetFileAbsoluteUrlPathname.startsWith(buildContext.urlPathname)) {
                    // NOTE: Should never happen
                    return match;
                }
                assetFileAbsoluteUrlPathname = assetFileAbsoluteUrlPathname.replace(
                    buildContext.urlPathname,
                    "/"
                );
            }

            inline_style_in_html: {
                if (cssFileRelativeDirPath !== undefined) {
                    break inline_style_in_html;
                }

                return `url(\${${!isAccountV3 ? "url.resourcesPath" : "resourceUrl"}}/${basenameOfTheKeycloakifyResourcesDir}${assetFileAbsoluteUrlPathname})`;
            }

            const assetFileRelativeUrlPathname = posix.relative(
                cssFileRelativeDirPath.replace(/\\/g, "/"),
                assetFileAbsoluteUrlPathname.replace(/^\//, "")
            );

            return `url(${assetFileRelativeUrlPathname})`;
        }
    );

    return { fixedCssCode };
}
