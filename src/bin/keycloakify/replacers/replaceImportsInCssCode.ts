import * as crypto from "crypto";
import type { BuildOptions } from "../buildOptions";
import { assert } from "tsafe/assert";
import { basenameOfTheKeycloakifyResourcesDir } from "../../constants";

export type BuildOptionsLike = {
    urlPathname: string | undefined;
};

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export function replaceImportsInCssCode(params: { cssCode: string }): {
    fixedCssCode: string;
    cssGlobalsToDefine: Record<string, string>;
} {
    const { cssCode } = params;

    const cssGlobalsToDefine: Record<string, string> = {};

    new Set(cssCode.match(/url\(["']?\/[^/][^)"']+["']?\)[^;}]*?/g) ?? []).forEach(
        match => (cssGlobalsToDefine["url" + crypto.createHash("sha256").update(match).digest("hex").substring(0, 15)] = match)
    );

    let fixedCssCode = cssCode;

    Object.keys(cssGlobalsToDefine).forEach(
        cssVariableName =>
            //NOTE: split/join pattern ~ replace all
            (fixedCssCode = fixedCssCode.split(cssGlobalsToDefine[cssVariableName]).join(`var(--${cssVariableName})`))
    );

    return { fixedCssCode, cssGlobalsToDefine };
}

export function generateCssCodeToDefineGlobals(params: { cssGlobalsToDefine: Record<string, string>; buildOptions: BuildOptionsLike }): {
    cssCodeToPrependInHead: string;
} {
    const { cssGlobalsToDefine, buildOptions } = params;

    return {
        "cssCodeToPrependInHead": [
            ":root {",
            ...Object.keys(cssGlobalsToDefine)
                .map(cssVariableName =>
                    [
                        `--${cssVariableName}:`,
                        cssGlobalsToDefine[cssVariableName].replace(
                            new RegExp(`url\\(${(buildOptions.urlPathname ?? "/").replace(/\//g, "\\/")}`, "g"),
                            `url(\${url.resourcesPath}/${basenameOfTheKeycloakifyResourcesDir}/`
                        )
                    ].join(" ")
                )
                .map(line => `    ${line};`),
            "}"
        ].join("\n")
    };
}
