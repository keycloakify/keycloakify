
import * as crypto from "crypto";

type Mode = {
    type: "standalone";
} | {
    type: "static fetched from app";
    urlOrigin: string;
    urlPathname: string;
}

export function replaceImportFromStaticInJsCode(
    params: {
        ftlValuesGlobalName: string;
        jsCode: string;
        mode: Mode;
    }
): { fixedJsCode: string; } {

    const { jsCode, ftlValuesGlobalName, mode } = params;

    const fixedJsCode = (() => {
        switch (mode.type) {
            case "standalone":
                return jsCode!.replace(
                    /[a-z]+\.[a-z]+\+"static\//g,
                    `window.${ftlValuesGlobalName}.url.resourcesPath + "/build/static/`
                );
            case "static fetched from app":
                return jsCode!.replace(
                    /[a-z]+\.[a-z]+\+"static\//g,
                    `"${mode.urlOrigin}${mode.urlPathname}static/`
                );
        }
    })();


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

    new Set(cssCode.match(/url\(\/[^)]+\)[^;}]*/g) ?? [])
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
        urlPathname: string;
    }
): {
    cssCodeToPrependInHead: string;
} {

    const { cssGlobalsToDefine, urlPathname } = params;

    return {
        "cssCodeToPrependInHead": [
            ":root {",
            ...Object.keys(cssGlobalsToDefine)
                .map(cssVariableName => [
                    `--${cssVariableName}:`,
                    cssGlobalsToDefine[cssVariableName]
                        .replace(new RegExp(`url\\(${urlPathname.replace(/\//g, "\\/")}`, "g"), "url(${url.resourcesPath}/build/")
                ].join(" "))
                .map(line => `    ${line};`),
            "}"
        ].join("\n")
    };

}



