import * as fs from "fs";
import * as path from "path";
import { crawl } from "./crawl";
import { id } from "tsafe/id";

type TransformSourceCode = (params: { sourceCode: Buffer; filePath: string; fileRelativePath: string }) =>
    | {
          modifiedSourceCode: Buffer;
          newFileName?: string;
      }
    | undefined;

/** Apply a transformation function to every file of directory */
export function transformCodebase(params: { srcDirPath: string; destDirPath: string; transformSourceCode?: TransformSourceCode }) {
    const {
        srcDirPath,
        destDirPath,
        transformSourceCode = id<TransformSourceCode>(({ sourceCode }) => ({
            "modifiedSourceCode": sourceCode
        }))
    } = params;

    for (const fileRelativePath of crawl({ "dirPath": srcDirPath, "returnedPathsType": "relative to dirPath" })) {
        const filePath = path.join(srcDirPath, fileRelativePath);

        const transformSourceCodeResult = transformSourceCode({
            "sourceCode": fs.readFileSync(filePath),
            filePath,
            fileRelativePath
        });

        if (transformSourceCodeResult === undefined) {
            continue;
        }

        fs.mkdirSync(path.dirname(path.join(destDirPath, fileRelativePath)), {
            "recursive": true
        });

        const { newFileName, modifiedSourceCode } = transformSourceCodeResult;

        fs.writeFileSync(
            path.join(path.dirname(path.join(destDirPath, fileRelativePath)), newFileName ?? path.basename(fileRelativePath)),
            modifiedSourceCode
        );
    }
}
