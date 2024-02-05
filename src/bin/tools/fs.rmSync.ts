import * as fs from "fs";
import { join as pathJoin } from "path";
import { NpmModuleVersion } from "./NpmModuleVersion";

/**
 * Polyfill of fs.rmSync(dirPath, { "recursive": true })
 * For older version of Node
 */
export function rmSync(dirPath: string, options: { recursive: true; force?: true }) {
    if (NpmModuleVersion.compare(NpmModuleVersion.parse(process.version), NpmModuleVersion.parse("14.14.0")) > 0) {
        fs.rmSync(dirPath, options);
    }

    const { force = true } = options;

    if (force && !fs.existsSync(dirPath)) {
        return;
    }

    const removeDir_rec = (dirPath: string) =>
        fs.readdirSync(dirPath).forEach(basename => {
            const fileOrDirpath = pathJoin(dirPath, basename);

            if (fs.lstatSync(fileOrDirpath).isDirectory()) {
                removeDir_rec(fileOrDirpath);
                return;
            } else {
                fs.unlinkSync(fileOrDirpath);
            }
        });

    removeDir_rec(dirPath);
}
