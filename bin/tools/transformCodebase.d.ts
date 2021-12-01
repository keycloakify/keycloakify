/// <reference types="node" />
declare type TransformSourceCode = (params: { sourceCode: Buffer; filePath: string }) =>
    | {
          modifiedSourceCode: Buffer;
          newFileName?: string;
      }
    | undefined;
/** Apply a transformation function to every file of directory */
export declare function transformCodebase(params: { srcDirPath: string; destDirPath: string; transformSourceCode?: TransformSourceCode }): void;
export {};
