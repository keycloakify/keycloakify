import * as fs from "fs/promises";
import { join as pathJoin } from "path";
import { SemVer } from "./SemVer";

/**
 * Polyfill of fs.rm(dirPath, { "recursive": true })
 * For older version of Node
 */
export async function rm(dirPath: string, options: { recursive: true; force?: true }) {
    if (SemVer.compare(SemVer.parse(process.version), SemVer.parse("14.14.0")) > 0) {
        return fs.rm(dirPath, options);
    }

    const { force = true } = options;

    if (force && !(await checkDirExists(dirPath))) {
        return;
    }

    const removeDir_rec = async (dirPath: string) =>
        Promise.all(
            (await fs.readdir(dirPath)).map(async basename => {
                const fileOrDirpath = pathJoin(dirPath, basename);

                if ((await fs.lstat(fileOrDirpath)).isDirectory()) {
                    await removeDir_rec(fileOrDirpath);
                } else {
                    await fs.unlink(fileOrDirpath);
                }
            })
        );

    await removeDir_rec(dirPath);
}

async function checkDirExists(dirPath: string) {
    try {
        await fs.access(dirPath, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}
