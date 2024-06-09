import * as crypto from "crypto";
import type { BuildContext } from "../../shared/buildContext";
import { assert } from "tsafe/assert";
import { basenameOfTheKeycloakifyResourcesDir } from "../../shared/constants";

export type BuildContextLike = {
    urlPathname: string | undefined;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export function replaceImportsInCssCode(params: { cssCode: string }): {
    fixedCssCode: string;
    cssGlobalsToDefine: Record<string, string>;
} {
    const { cssCode } = params;

    const cssGlobalsToDefine: Record<string, string> = {};

    new Set(cssCode.match(/url\(["']?\/[^/][^)"']+["']?\)[^;}]*?/g) ?? []).forEach(
        match =>
            (cssGlobalsToDefine[
                "url" +
                    crypto
                        .createHash("sha256")
                        .update(match)
                        .digest("hex")
                        .substring(0, 15)
            ] = match)
    );

    let fixedCssCode = cssCode;

    Object.keys(cssGlobalsToDefine).forEach(
        cssVariableName =>
            //NOTE: split/join pattern ~ replace all
            (fixedCssCode = fixedCssCode
                .split(cssGlobalsToDefine[cssVariableName])
                .join(`var(--${cssVariableName})`))
    );

    return { fixedCssCode, cssGlobalsToDefine };
}

export function generateCssCodeToDefineGlobals(params: {
    cssGlobalsToDefine: Record<string, string>;
    buildContext: BuildContextLike;
}): {
    cssCodeToPrependInHead: string;
} {
    const { cssGlobalsToDefine, buildContext } = params;

    return {
        cssCodeToPrependInHead: [
            ":root {",
            ...Object.keys(cssGlobalsToDefine)
                .map(cssVariableName =>
                    [
                        `--${cssVariableName}:`,
                        cssGlobalsToDefine[cssVariableName].replace(
                            new RegExp(
                                `url\\(${(buildContext.urlPathname ?? "/").replace(
                                    /\//g,
                                    "\\/"
                                )}`,
                                "g"
                            ),
                            `url(\${url.resourcesPath}/${basenameOfTheKeycloakifyResourcesDir}/`
                        )
                    ].join(" ")
                )
                .map(line => `    ${line};`),
            "}"
        ].join("\n")
    };
}
