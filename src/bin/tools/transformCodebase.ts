import * as fs from "fs";
import * as path from "path";
import { crawl } from "./crawl";
import { id } from "tsafe/id";
import { rmSync } from "../tools/fs.rmSync";

type TransformSourceCode = (params: { sourceCode: Buffer; filePath: string; fileRelativePath: string }) =>
    | {
          modifiedSourceCode: Buffer;
          newFileName?: string;
      }
    | undefined;

/**
 * Apply a transformation function to every file of directory
 * If source and destination are the same this function can be used to apply the transformation in place
 * like filtering out some files or modifying them.
 * */
export function transformCodebase(params: { srcDirPath: string; destDirPath: string; transformSourceCode?: TransformSourceCode }) {
    const {
        srcDirPath,
        transformSourceCode = id<TransformSourceCode>(({ sourceCode }) => ({
            "modifiedSourceCode": sourceCode
        }))
    } = params;
    let { destDirPath } = params;

    const isTargetSameAsSource = path.relative(srcDirPath, destDirPath) === "";

    if (isTargetSameAsSource) {
        destDirPath = path.join(srcDirPath, "..", "tmp_xOsPdkPsTdzPs34sOkHs");
    }

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

    if (isTargetSameAsSource) {
        rmSync(srcDirPath, { "recursive": true });

        fs.renameSync(destDirPath, srcDirPath);
    }
}
