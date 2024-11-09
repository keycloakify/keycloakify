import * as fs from "fs";
import { join as pathJoin } from "path";
import * as child_process from "child_process";
import chalk from "chalk";

export function npmInstall(params: { packageJsonDirPath: string }) {
    const { packageJsonDirPath } = params;

    const packageManagerBinName = (() => {
        const packageMangers = [
            {
                binName: "yarn",
                lockFileBasename: "yarn.lock"
            },
            {
                binName: "npm",
                lockFileBasename: "package-lock.json"
            },
            {
                binName: "pnpm",
                lockFileBasename: "pnpm-lock.yaml"
            },
            {
                binName: "bun",
                lockFileBasename: "bun.lockdb"
            },
            {
                binName: "deno",
                lockFileBasename: "deno.lock"
            }
        ] as const;

        for (const packageManager of packageMangers) {
            if (
                fs.existsSync(
                    pathJoin(packageJsonDirPath, packageManager.lockFileBasename)
                ) ||
                fs.existsSync(pathJoin(process.cwd(), packageManager.lockFileBasename))
            ) {
                return packageManager.binName;
            }
        }

        throw new Error(
            "No lock file found, cannot tell which package manager to use for installing dependencies."
        );
    })();

    console.log(`Installing the new dependencies...`);

    try {
        child_process.execSync(`${packageManagerBinName} install`, {
            cwd: packageJsonDirPath,
            stdio: "inherit"
        });
    } catch {
        console.log(
            chalk.yellow(
                `\`${packageManagerBinName} install\` failed, continuing anyway...`
            )
        );
    }
}
