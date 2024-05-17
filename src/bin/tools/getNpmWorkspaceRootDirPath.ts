import * as child_process from "child_process";
import { join as pathJoin, resolve as pathResolve, sep as pathSep } from "path";
import { assert } from "tsafe/assert";

export function getNpmWorkspaceRootDirPath(params: { reactAppRootDirPath: string }) {
    const { reactAppRootDirPath } = params;

    const npmWorkspaceRootDirPath = (function callee(depth: number): string {
        const cwd = pathResolve(pathJoin(...[reactAppRootDirPath, ...Array(depth).fill("..")]));

        try {
            child_process.execSync("npm config get", { cwd, "stdio": "ignore" });
        } catch (error) {
            if (String(error).includes("ENOWORKSPACES")) {
                assert(cwd !== pathSep, "NPM workspace not found");

                return callee(depth + 1);
            }

            throw error;
        }

        return cwd;
    })(0);

    return { npmWorkspaceRootDirPath };
}
