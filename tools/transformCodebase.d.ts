/// <reference types="node" />
/** Apply a transformation function to every file of directory */
export declare function transformCodebase(params: {
    srcDirPath: string;
    destDirPath: string;
    transformSourceCodeString: (params: {
        sourceCode: Buffer;
        filePath: string;
    }) => {
        modifiedSourceCode: Buffer;
        newFileName?: string;
    } | undefined;
}): void;
