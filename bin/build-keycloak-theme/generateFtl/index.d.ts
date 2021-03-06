export declare type PageId = "login.ftl" | "register.ftl" | "info.ftl" | "error.ftl";
export declare function generateFtlFilesCodeFactory(params: {
    ftlValuesGlobalName: string;
    cssGlobalsToDefine: Record<string, string>;
    indexHtmlCode: string;
}): {
    generateFtlFilesCode: (params: {
        pageId: PageId;
    }) => {
        ftlCode: string;
    };
};
