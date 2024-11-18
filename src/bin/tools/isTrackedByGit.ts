import * as child_process from "child_process";
import { dirname as pathDirname, basename as pathBasename } from "path";
import { Deferred } from "evt/tools/Deferred";

export function getIsTrackedByGit(params: { filePath: string }): Promise<boolean> {
    const { filePath } = params;

    const dIsTracked = new Deferred<boolean>();

    child_process.exec(
        `git ls-files --error-unmatch ${pathBasename(filePath)}`,
        { cwd: pathDirname(filePath) },
        error => {
            if (error === null) {
                dIsTracked.resolve(true);
                return;
            }

            if (error.code === 1) {
                dIsTracked.resolve(false);
                return;
            }

            dIsTracked.reject(error);
        }
    );

    return dIsTracked.pr;
}
