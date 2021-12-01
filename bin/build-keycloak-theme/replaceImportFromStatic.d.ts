export declare function replaceImportsFromStaticInJsCode(params: { jsCode: string; urlOrigin: undefined | string }): {
    fixedJsCode: string;
};
export declare function replaceImportsInInlineCssCode(params: { cssCode: string; urlPathname: string; urlOrigin: undefined | string }): {
    fixedCssCode: string;
};
export declare function replaceImportsInCssCode(params: { cssCode: string }): {
    fixedCssCode: string;
    cssGlobalsToDefine: Record<string, string>;
};
export declare function generateCssCodeToDefineGlobals(params: { cssGlobalsToDefine: Record<string, string>; urlPathname: string }): {
    cssCodeToPrependInHead: string;
};
