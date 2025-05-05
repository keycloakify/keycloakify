import { transformCodebase } from "../../src/bin/tools/transformCodebase";

export function patchJsxElement(params: { distDirPath: string }) {
    const { distDirPath } = params;

    transformCodebase({
        srcDirPath: distDirPath,
        destDirPath: distDirPath,
        transformSourceCode: ({ fileRelativePath, sourceCode }) => {
            if (!fileRelativePath.endsWith(".d.ts")) {
                return { modifiedSourceCode: sourceCode };
            }

            let modifiedSourceCode = sourceCode.toString("utf8");

            modifiedSourceCode = modifiedSourceCode.replace(
                /globalThis\.JSX\.Element/g,
                "React.ReactElement<any, any>"
            );
            modifiedSourceCode = modifiedSourceCode.replace(
                /JSX\.Element/g,
                "React.ReactElement<any, any>"
            );

            return { modifiedSourceCode: Buffer.from(modifiedSourceCode, "utf8") };
        }
    });
}
