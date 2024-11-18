import * as child_process from "child_process";
import { dirname as pathDirname, basename as pathBasename } from "path";
import { Deferred } from "evt/tools/Deferred";

export async function untrackFromGit(params: { filePath: string }): Promise<void> {
    const { filePath } = params;

    const dDone = new Deferred<void>();

    child_process.exec(
        `git rm --cached ${pathBasename(filePath)}`,
        { cwd: pathDirname(filePath) },
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
