import type { BuildContext } from "../../shared/buildContext";
import { BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR } from "../../shared/constants";
import { assert } from "tsafe/assert";
import { posix } from "path";

export type BuildContextLike = {
    urlPathname: string | undefined;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export function replaceImportsInCssCode(params: {
    cssCode: string;
    cssFileRelativeDirPath: string | undefined;
    buildContext: BuildContextLike;
}): {
    fixedCssCode: string;
} {
    const { cssCode, cssFileRelativeDirPath, buildContext } = params;

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

                return `url(\${xKeycloakify.resourcesPath}/${BASENAME_OF_KEYCLOAKIFY_RESOURCES_DIR}${assetFileAbsoluteUrlPathname})`;
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
