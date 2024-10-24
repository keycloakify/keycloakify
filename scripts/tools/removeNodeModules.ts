import * as fs from "fs";
import { crawl } from "../../src/bin/tools/crawl";

export function removeNodeModules(params: { nodeModulesDirPath: string }) {
    const { nodeModulesDirPath } = params;

    try {
        fs.rmSync(nodeModulesDirPath, { recursive: true, force: true });
    } catch {
        // NOTE: This is a workaround for windows
        // we can't remove locked executables.

        crawl({
            dirPath: nodeModulesDirPath,
            returnedPathsType: "absolute"
        }).forEach(filePath => {
            try {
                fs.rmSync(filePath, { force: true });
            } catch (error) {
                if (filePath.endsWith(".exe")) {
                    return;
                }
                throw error;
            }
        });
    }
}
