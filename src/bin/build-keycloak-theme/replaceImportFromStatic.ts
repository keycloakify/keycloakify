
import * as crypto from "crypto";

export function replaceImportFromStaticInJsCode(
    params: {
        ftlValuesGlobalName: string;
        jsCode: string;
    }
): { fixedJsCode: string; } {

    const { jsCode, ftlValuesGlobalName } = params;

    const fixedJsCode = jsCode!.replace(
        /"static\//g,
        `window.${ftlValuesGlobalName}.url.resourcesPath.replace(/^\\//,"") + "/build/static/`
    );

    return { fixedJsCode };

}

export function replaceImportFromStaticInCssCode(
    params: {
        cssCode: string;
    }
): {
    fixedCssCode: string;
    cssGlobalsToDefine: Record<string, string>;
} {

    const { cssCode } = params;

    const cssGlobalsToDefine: Record<string, string> = {};

    new Set(cssCode.match(/(url\(\/[^)]+\))/g) ?? [])
        .forEach(match =>
            cssGlobalsToDefine[
            "url" + crypto
                .createHash("sha256")
                .update(match)
                .digest("hex")
                .substring(0, 15)
            ] = match
        );

    let fixedCssCode = cssCode;

    Object.keys(cssGlobalsToDefine).forEach(
        cssVariableName =>
            //NOTE: split/join pattern ~ replace all
            fixedCssCode =
            fixedCssCode.split(cssGlobalsToDefine[cssVariableName])
                .join(`var(--${cssVariableName})`)
    );

    return { fixedCssCode, cssGlobalsToDefine };

}

export function generateCssCodeToDefineGlobals(
    params: {
        cssGlobalsToDefine: Record<string, string>;
    }
): {
    cssCodeToPrependInHead: string;
} {

    const { cssGlobalsToDefine } = params;

    return {
        "cssCodeToPrependInHead": [
            ":root {",
            ...Object.keys(cssGlobalsToDefine)
                .map(cssVariableName => [
                    `--${cssVariableName}:`,
                    [
                        "url(",
                        "${url.resourcesPath}/build" +
                        cssGlobalsToDefine[cssVariableName].match(/^url\(([^)]+)\)$/)![1],
                        ")"
                    ].join("")
                ].join(" "))
                .map(line => `    ${line};`),
            "}"
        ].join("\n")
    };

}



