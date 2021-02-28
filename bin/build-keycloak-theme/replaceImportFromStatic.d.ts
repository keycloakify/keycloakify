export declare function replaceImportFromStaticInJsCode(params: {
    ftlValuesGlobalName: string;
    jsCode: string;
}): {
    fixedJsCode: string;
};
export declare function replaceImportFromStaticInCssCode(params: {
    cssCode: string;
}): {
    fixedCssCode: string;
    cssGlobalsToDefine: Record<string, string>;
};
export declare function generateCssCodeToDefineGlobals(params: {
    cssGlobalsToDefine: Record<string, string>;
}): {
    cssCodeToPrependInHead: string;
};
