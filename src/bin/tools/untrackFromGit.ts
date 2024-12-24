import * as child_process from "child_process";
import {
    dirname as pathDirname,
    basename as pathBasename,
    join as pathJoin,
    sep as pathSep
} from "path";
import { Deferred } from "evt/tools/Deferred";
import { existsAsync } from "./fs.existsAsync";

export async function untrackFromGit(params: { filePath: string }): Promise<void> {
    const { filePath } = params;

    const dDone = new Deferred<void>();

    let relativePath = pathBasename(filePath);

    let dirPath = pathDirname(filePath);

    while (!(await existsAsync(dirPath))) {
        relativePath = pathJoin(pathBasename(dirPath), relativePath);

        dirPath = pathDirname(dirPath);
    }

    child_process.exec(
        `git rm --cached '${relativePath.split(pathSep).join("/")}'`,
        { cwd: dirPath },
        error => {
            if (error !== null) {
                dDone.reject(error);
                return;
            }

            dDone.resolve();
        }
    );

    await dDone.pr;
}
