import * as fs from "fs";
import * as path from "path";
import { crawl } from "./crawl";
import { id } from "tsafe/id";

type TransformSourceCode = (params: {
    sourceCode: Buffer;
    filePath: string;
}) =>
    | {
          modifiedSourceCode: Buffer;
          newFileName?: string;
      }
    | undefined;

/** Apply a transformation function to every file of directory */
export function transformCodebase(params: {
    srcDirPath: string;
    destDirPath: string;
    transformSourceCode?: TransformSourceCode;
}) {
    const {
        srcDirPath,
        destDirPath,
        transformSourceCode = id<TransformSourceCode>(({ sourceCode }) => ({
            "modifiedSourceCode": sourceCode,
        })),
    } = params;

    for (const file_relative_path of crawl(srcDirPath)) {
        const filePath = path.join(srcDirPath, file_relative_path);

        const transformSourceCodeResult = transformSourceCode({
            "sourceCode": fs.readFileSync(filePath),
            "filePath": path.join(srcDirPath, file_relative_path),
        });

        if (transformSourceCodeResult === undefined) {
            continue;
        }

        fs.mkdirSync(path.dirname(path.join(destDirPath, file_relative_path)), {
            "recursive": true,
        });

        const { newFileName, modifiedSourceCode } = transformSourceCodeResult;

        fs.writeFileSync(
            path.join(
                path.dirname(path.join(destDirPath, file_relative_path)),
                newFileName ?? path.basename(file_relative_path),
            ),
            modifiedSourceCode,
        );
    }
}
