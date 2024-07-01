import * as fs from "fs";
import { join as pathJoin } from "path";
import { SemVer } from "./SemVer";

/**
 * Polyfill of fs.rmSync(dirPath, { "recursive": true })
 * For older version of Node
 */
export function rmSync(dirPath: string, options: { recursive: true; force?: true }) {
    if (SemVer.compare(SemVer.parse(process.version), SemVer.parse("14.14.0")) > 0) {
        fs.rmSync(dirPath, options);
        return;
    }

    const { force = true } = options;

    if (force && !fs.existsSync(dirPath)) {
        return;
    }

    const removeDir_rec = (dirPath: string) =>
        fs.readdirSync(dirPath).forEach(basename => {
            const fileOrDirPath = pathJoin(dirPath, basename);

            if (fs.lstatSync(fileOrDirPath).isDirectory()) {
                removeDir_rec(fileOrDirPath);
                return;
            } else {
                fs.unlinkSync(fileOrDirPath);
            }
        });

    removeDir_rec(dirPath);
}
