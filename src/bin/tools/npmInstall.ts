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

        return undefined;
    })();

    install_dependencies: {
        if (packageManagerBinName === undefined) {
            break install_dependencies;
        }

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
}
