import * as child_process from "child_process";
import { join as pathJoin, resolve as pathResolve, sep as pathSep } from "path";
import { assert } from "tsafe/assert";
import * as fs from "fs";

export function getNpmWorkspaceRootDirPath(params: {
    projectDirPath: string;
    dependencyExpected: string;
}) {
    const { projectDirPath, dependencyExpected } = params;

    console.log("DEBUG getNpmWorkspaceRootDirPath:", {
        projectDirPath,
        dependencyExpected
    });

    const npmWorkspaceRootDirPath = (function callee(depth: number): string {
        const cwd = pathResolve(
            pathJoin(...[projectDirPath, ...Array(depth).fill("..")])
        );

        console.log("DEBUG getNpmWorkspaceRootDirPath:", { cwd });

        assert(cwd !== pathSep, "NPM workspace not found");

        try {
            child_process.execSync("npm config get", {
                cwd,
                stdio: "ignore"
            });
        } catch (error) {
            console.log("DEBUG getNpmWorkspaceRootDirPath: got error npm config get");

            if (String(error).includes("ENOWORKSPACES")) {
                return callee(depth + 1);
            }

            throw error;
        }

        console.log("DEBUG getNpmWorkspaceRootDirPath: npm workspace found");

        const packageJsonFilePath = pathJoin(cwd, "package.json");

        if (!fs.existsSync(packageJsonFilePath)) {
            return callee(depth + 1);
        }

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

        if (!isExpectedDependencyFound && parsedPackageJson.name !== dependencyExpected) {
            return callee(depth + 1);
        }

        return cwd;
    })(0);

    return { npmWorkspaceRootDirPath };
}
