import * as crypto from "crypto";
import { ftlValuesGlobalName } from "./ftlValuesGlobalName";

export function replaceImportsFromStaticInJsCode(params: {
    jsCode: string;
    urlOrigin: undefined | string;
}): { fixedJsCode: string } {
    /* 
    NOTE:

    When we have urlOrigin defined it means that 
    we are building with --external-assets
    so we have to make sur that the fixed js code will run 
    inside and outside keycloak.

    When urlOrigin isn't defined we can assume the fixedJsCode
    will always run in keycloak context.
    */

    const { jsCode, urlOrigin } = params;

    const fixedJsCode = jsCode
        .replace(/([a-z]+\.[a-z]+)\+"static\//g, (...[, group]) =>
            urlOrigin === undefined
                ? `window.${ftlValuesGlobalName}.url.resourcesPath + "/build/static/`
                : `("${ftlValuesGlobalName}" in window ? "${urlOrigin}" : "") + ${group} + "static/`,
        )
        .replace(
            /".chunk.css",([a-z])+=([a-z]+\.[a-z]+)\+([a-z]+),/,
            (...[, group1, group2, group3]) =>
                urlOrigin === undefined
                    ? `".chunk.css",${group1} = window.${ftlValuesGlobalName}.url.resourcesPath + "/build/" + ${group3},`
                    : `".chunk.css",${group1} = ("${ftlValuesGlobalName}" in window ? "${urlOrigin}" : "") + ${group2} + ${group3},`,
        );

    return { fixedJsCode };
}

export function replaceImportsInInlineCssCode(params: {
    cssCode: string;
    urlPathname: string;
    urlOrigin: undefined | string;
}): { fixedCssCode: string } {
    const { cssCode, urlPathname, urlOrigin } = params;

    const fixedCssCode = cssCode.replace(
        urlPathname === "/"
            ? /url\(\/([^/][^)]+)\)/g
            : new RegExp(`url\\(${urlPathname}([^)]+)\\)`, "g"),
        (...[, group]) =>
            `url(${
                urlOrigin === undefined
                    ? "${url.resourcesPath}/build/" + group
                    : params.urlOrigin + urlPathname + group
            })`,
    );

    return { fixedCssCode };
}

export function replaceImportsInCssCode(params: { cssCode: string }): {
    fixedCssCode: string;
    cssGlobalsToDefine: Record<string, string>;
} {
    const { cssCode } = params;

    const cssGlobalsToDefine: Record<string, string> = {};

    new Set(cssCode.match(/url\(\/[^/][^)]+\)[^;}]*/g) ?? []).forEach(
        match =>
            (cssGlobalsToDefine[
                "url" +
                    crypto
                        .createHash("sha256")
                        .update(match)
                        .digest("hex")
                        .substring(0, 15)
            ] = match),
    );

    let fixedCssCode = cssCode;

    Object.keys(cssGlobalsToDefine).forEach(
        cssVariableName =>
            //NOTE: split/join pattern ~ replace all
            (fixedCssCode = fixedCssCode
                .split(cssGlobalsToDefine[cssVariableName])
                .join(`var(--${cssVariableName})`)),
    );

    return { fixedCssCode, cssGlobalsToDefine };
}

export function generateCssCodeToDefineGlobals(params: {
    cssGlobalsToDefine: Record<string, string>;
    urlPathname: string;
}): {
    cssCodeToPrependInHead: string;
} {
    const { cssGlobalsToDefine, urlPathname } = params;

    return {
        "cssCodeToPrependInHead": [
            ":root {",
            ...Object.keys(cssGlobalsToDefine)
                .map(cssVariableName =>
                    [
                        `--${cssVariableName}:`,
                        cssGlobalsToDefine[cssVariableName].replace(
                            new RegExp(
                                `url\\(${urlPathname.replace(/\//g, "\\/")}`,
                                "g",
                            ),
                            "url(${url.resourcesPath}/build/",
                        ),
                    ].join(" "),
                )
                .map(line => `    ${line};`),
            "}",
        ].join("\n"),
    };
}
