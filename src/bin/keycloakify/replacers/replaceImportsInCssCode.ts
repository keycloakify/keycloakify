import type { BuildContext } from "../../shared/buildContext";
import { assert } from "tsafe/assert";
import { posix } from "path";

export type BuildContextLike = {
    urlPathname: string | undefined;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export function replaceImportsInCssCode(params: {
    cssCode: string;
    fileRelativeDirPath: string;
    buildContext: BuildContextLike;
}): {
    fixedCssCode: string;
} {
    const { cssCode, fileRelativeDirPath, buildContext } = params;

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

            const assetFileRelativeUrlPathname = posix.relative(
                fileRelativeDirPath.replace(/\\/g, "/"),
                assetFileAbsoluteUrlPathname.replace(/^\//, "")
            );

            return `url(${assetFileRelativeUrlPathname})`;
        }
    );

    return { fixedCssCode };
}
