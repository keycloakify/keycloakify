import * as child_process from "child_process";
import { dirname as pathDirname, basename as pathBasename } from "path";
import { Deferred } from "evt/tools/Deferred";

export function getIsKnownByGit(params: { filePath: string }): Promise<boolean> {
    const { filePath } = params;

    const dIsKnownByGit = new Deferred<boolean>();

    child_process.exec(
        `git ls-files --error-unmatch ${pathBasename(filePath)}`,
        { cwd: pathDirname(filePath) },
        error => {
            if (error === null) {
                dIsKnownByGit.resolve(true);
                return;
            }

            if (error.code === 1) {
                dIsKnownByGit.resolve(false);
                return;
            }

            dIsKnownByGit.reject(error);
        }
    );

    return dIsKnownByGit.pr;
}
