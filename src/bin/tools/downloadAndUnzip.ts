import { basename as pathBasename, join as pathJoin } from "path";
import { execSync } from "child_process";
import fs from "fs";
import { transformCodebase } from "./transformCodebase";
import { rm_rf } from "./rm";

/** assert url ends with .zip */
export function downloadAndUnzip(params: { url: string; destDirPath: string; pathOfDirToExtractInArchive?: string }) {
    const { url, destDirPath, pathOfDirToExtractInArchive } = params;

    const tmpDirPath = pathJoin(destDirPath, "..", "tmp_xxKdOxnEdx");
    const zipFilePath = pathBasename(url);

    if (!fs.existsSync(pathJoin(tmpDirPath, zipFilePath))) {
        rm_rf(tmpDirPath);

        fs.mkdirSync(tmpDirPath, { "recursive": true });

        execSync(`curl -L ${url} -o ${zipFilePath}`, { "cwd": tmpDirPath });
    }

    execSync(`unzip -o ${zipFilePath}${pathOfDirToExtractInArchive === undefined ? "" : ` "${pathOfDirToExtractInArchive}/**/*"`}`, {
        "cwd": tmpDirPath,
    });

    transformCodebase({
        "srcDirPath": pathOfDirToExtractInArchive === undefined ? tmpDirPath : pathJoin(tmpDirPath, pathOfDirToExtractInArchive),
        destDirPath,
    });
}
