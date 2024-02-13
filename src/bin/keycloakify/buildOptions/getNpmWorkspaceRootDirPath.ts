import * as child_process from "child_process";
import { join as pathJoin, resolve as pathResolve, sep as pathSep } from "path";
import { assert } from "tsafe/assert";

let cache:
    | {
          reactAppRootDirPath: string;
          npmWorkspaceRootDirPath: string;
      }
    | undefined = undefined;

export function getNpmWorkspaceRootDirPath(params: { reactAppRootDirPath: string }) {
    const { reactAppRootDirPath } = params;

    use_cache: {
        if (cache === undefined || cache.reactAppRootDirPath !== reactAppRootDirPath) {
            break use_cache;
        }

        const { npmWorkspaceRootDirPath } = cache;

        return { npmWorkspaceRootDirPath };
    }

    const npmWorkspaceRootDirPath = (function callee(depth: number): string {
        const cwd = pathResolve(pathJoin(...[reactAppRootDirPath, ...Array(depth).fill("..")]));

        try {
            child_process.execSync("npm config get", { cwd: cwd });
        } catch (error) {
            if (String(error).includes("ENOWORKSPACES")) {
                assert(cwd !== pathSep, "NPM workspace not found");

                return callee(depth + 1);
            }

            throw error;
        }

        return cwd;
    })(0);

    cache = {
        reactAppRootDirPath,
        npmWorkspaceRootDirPath
    };

    return { npmWorkspaceRootDirPath };
}
