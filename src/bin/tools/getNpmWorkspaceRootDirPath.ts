import * as child_process from "child_process";
import { join as pathJoin, resolve as pathResolve, sep as pathSep } from "path";
import { assert } from "tsafe/assert";
import * as fs from "fs";

export function getNpmWorkspaceRootDirPath(params: {
    reactAppRootDirPath: string;
    dependencyExpected: string;
}) {
    const { reactAppRootDirPath, dependencyExpected } = params;

    const npmWorkspaceRootDirPath = (function callee(depth: number): string {
        const cwd = pathResolve(
            pathJoin(...[reactAppRootDirPath, ...Array(depth).fill("..")])
        );

        try {
            child_process.execSync("npm config get", {
                cwd,
                stdio: "ignore"
            });
        } catch (error) {
            if (String(error).includes("ENOWORKSPACES")) {
                assert(cwd !== pathSep, "NPM workspace not found");

                return callee(depth + 1);
            }

            throw error;
        }

        const { isExpectedDependencyFound } = (() => {
            const packageJsonFilePath = pathJoin(cwd, "package.json");

            assert(fs.existsSync(packageJsonFilePath));

            const parsedPackageJson = JSON.parse(
                fs.readFileSync(packageJsonFilePath).toString("utf8")
            );

            let isExpectedDependencyFound = false;

            for (const dependenciesOrDevDependencies of [
                "dependencies",
                "devDependencies"
            ] as const) {
                const dependencies = parsedPackageJson[dependenciesOrDevDependencies];

                if (dependencies === undefined) {
                    continue;
                }

                assert(dependencies instanceof Object);

                if (dependencies[dependencyExpected] === undefined) {
                    continue;
                }

                isExpectedDependencyFound = true;
            }

            return { isExpectedDependencyFound };
        })();

        if (!isExpectedDependencyFound) {
            return callee(depth + 1);
        }

        return cwd;
    })(0);

    return { npmWorkspaceRootDirPath };
}
