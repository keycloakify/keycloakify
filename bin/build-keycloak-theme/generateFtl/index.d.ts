export declare const pageIds: readonly ["login.ftl", "register.ftl", "info.ftl", "error.ftl"];
export declare type PageId = typeof pageIds[number];
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
