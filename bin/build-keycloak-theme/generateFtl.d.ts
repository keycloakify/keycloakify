export declare function generateFtlFilesCodeFactory(params: {
    ftlValuesGlobalName: string;
    cssGlobalsToDefine: Record<string, string>;
    indexHtmlCode: string;
}): {
    generateFtlFilesCode: (params: {
        pageBasename: "login.ftl" | "register.ftl";
    }) => {
        ftlCode: string;
    };
};
