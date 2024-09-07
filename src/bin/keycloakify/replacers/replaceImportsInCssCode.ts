import type { BuildContext } from "../../shared/buildContext";
import { WELL_KNOWN_DIRECTORY_BASE_NAME } from "../../shared/constants";
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

    let fixedCssCode = cssCode;

    [
        /url\("(\/[^/][^"]+)"\)/g,
        /url\('(\/[^/][^']+)'\)/g,
        /url\((\/[^/][^)]+)\)/g
    ].forEach(
        regex =>
            (fixedCssCode = fixedCssCode.replace(
                regex,
                (match, assetFileAbsoluteUrlPathname) => {
                    if (buildContext.urlPathname !== undefined) {
                        if (
                            !assetFileAbsoluteUrlPathname.startsWith(
                                buildContext.urlPathname
                            )
                        ) {
                            // NOTE: Should never happen
                            return match;
                        }
                        assetFileAbsoluteUrlPathname =
                            assetFileAbsoluteUrlPathname.replace(
                                buildContext.urlPathname,
                                "/"
                            );
                    }

                    inline_style_in_html: {
                        if (cssFileRelativeDirPath !== undefined) {
                            break inline_style_in_html;
                        }

                        return `url("\${xKeycloakify.resourcesPath}/${WELL_KNOWN_DIRECTORY_BASE_NAME.DIST}${assetFileAbsoluteUrlPathname}")`;
                    }

                    const assetFileRelativeUrlPathname = posix.relative(
                        cssFileRelativeDirPath.replace(/\\/g, "/"),
                        assetFileAbsoluteUrlPathname.replace(/^\//, "")
                    );

                    return `url("${assetFileRelativeUrlPathname}")`;
                }
            ))
    );

    return { fixedCssCode };
}
