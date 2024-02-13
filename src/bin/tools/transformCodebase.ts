import * as fs from "fs";
import * as path from "path";
import { crawl } from "./crawl";
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
    const { srcDirPath, transformSourceCode } = params;

    const isTargetSameAsSource = path.relative(srcDirPath, params.destDirPath) === "";

    const destDirPath = isTargetSameAsSource ? path.join(srcDirPath, "..", "tmp_xOsPdkPsTdzPs34sOkHs") : params.destDirPath;

    fs.mkdirSync(destDirPath, {
        "recursive": true
    });

    for (const fileRelativePath of crawl({ "dirPath": srcDirPath, "returnedPathsType": "relative to dirPath" })) {
        const filePath = path.join(srcDirPath, fileRelativePath);
        const destFilePath = path.join(destDirPath, fileRelativePath);

        // NOTE: Optimization, if we don't need to transform the file, just copy
        // it using the lower level implementation.
        if (transformSourceCode === undefined) {
            fs.mkdirSync(path.dirname(destFilePath), {
                "recursive": true
            });

            fs.copyFileSync(filePath, destFilePath);

            continue;
        }

        const transformSourceCodeResult = transformSourceCode({
            "sourceCode": fs.readFileSync(filePath),
            filePath,
            fileRelativePath
        });

        if (transformSourceCodeResult === undefined) {
            continue;
        }

        fs.mkdirSync(path.dirname(destFilePath), {
            "recursive": true
        });

        const { newFileName, modifiedSourceCode } = transformSourceCodeResult;

        fs.writeFileSync(path.join(path.dirname(destFilePath), newFileName ?? path.basename(destFilePath)), modifiedSourceCode);
    }

    if (isTargetSameAsSource) {
        rmSync(srcDirPath, { "recursive": true });

        fs.renameSync(destDirPath, srcDirPath);
    }
}
