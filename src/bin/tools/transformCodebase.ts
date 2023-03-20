import * as fs from "fs/promises";
import * as path from "path";
import { crawl } from "./crawl";
import { id } from "tsafe/id";

type TransformSourceCode = (params: { sourceCode: Buffer; filePath: string }) =>
    | {
          modifiedSourceCode: Buffer;
          newFileName?: string;
      }
    | undefined;

/** Apply a transformation function to every file of directory */
export async function transformCodebase(params: { srcDirPath: string; destDirPath: string; transformSourceCode?: TransformSourceCode }) {
    const {
        srcDirPath,
        destDirPath,
        transformSourceCode = id<TransformSourceCode>(({ sourceCode }) => ({
            "modifiedSourceCode": sourceCode
        }))
    } = params;

    const filePromises = (await crawl(srcDirPath)).map(async file_relative_path => {
        const filePath = path.join(srcDirPath, file_relative_path);

        const transformSourceCodeResult = transformSourceCode({
            "sourceCode": await fs.readFile(filePath),
            "filePath": path.join(srcDirPath, file_relative_path)
        });

        if (transformSourceCodeResult === undefined) {
            return;
        }

        await fs.mkdir(path.dirname(path.join(destDirPath, file_relative_path)), {
            "recursive": true
        });

        const { newFileName, modifiedSourceCode } = transformSourceCodeResult;

        await fs.writeFile(
            path.join(path.dirname(path.join(destDirPath, file_relative_path)), newFileName ?? path.basename(file_relative_path)),
            modifiedSourceCode
        );
    });

    await Promise.all(filePromises);
}
