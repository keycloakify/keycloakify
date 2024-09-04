import { generateResources } from "./generateResources";
import { join as pathJoin, relative as pathRelative, sep as pathSep } from "path";
import * as child_process from "child_process";
import * as fs from "fs";
import { getBuildContext } from "../shared/buildContext";
import { VITE_PLUGIN_SUB_SCRIPTS_ENV_NAMES } from "../shared/constants";
import { buildJars } from "./buildJars";
import type { CliCommandOptions } from "../main";
import chalk from "chalk";
import { readThisNpmPackageVersion } from "../tools/readThisNpmPackageVersion";
import * as os from "os";
import { rmSync } from "../tools/fs.rmSync";

export async function command(params: { cliCommandOptions: CliCommandOptions }) {
    const { cliCommandOptions } = params;

    const buildContext = getBuildContext({ cliCommandOptions });

    exit_if_maven_not_installed: {
        let commandOutput: Buffer | undefined = undefined;

        try {
            commandOutput = child_process.execSync("mvn --version", {
                stdio: ["ignore", "pipe", "ignore"]
            });
        } catch {}

        if (commandOutput?.toString("utf8").includes("Apache Maven")) {
            break exit_if_maven_not_installed;
        }

        if (
            fs
                .readFileSync(buildContext.packageJsonFilePath)
                .toString("utf8")
                .includes(`"mvn"`)
        ) {
            console.log(
                chalk.red(
                    [
                        "Please remove the 'mvn' package from your package.json'dependencies list,",
                        "reinstall your dependencies and try again.",
                        "We need the Apache Maven CLI, not this: https://www.npmjs.com/package/mvn"
                    ].join(" ")
                )
            );
        } else {
            const installationCommand = (() => {
                switch (os.platform()) {
                    case "darwin":
                        return "brew install mvn";
                    case "win32":
                        return "choco install mvn";
                    case "linux":
                    default:
                        return "sudo apt-get install mvn";
                }
            })();

            console.log(
                `${chalk.red("Apache Maven required.")} Install it with \`${chalk.bold(
                    installationCommand
                )}\` (for example)`
            );
        }

        process.exit(1);
    }

    console.log(
        [
            chalk.cyan(`keycloakify v${readThisNpmPackageVersion()}`),
            chalk.green(
                `Building the keycloak theme in .${pathSep}${pathRelative(
                    process.cwd(),
                    buildContext.keycloakifyBuildDirPath
                )} ...`
            )
        ].join(" ")
    );

    const startTime = Date.now();

    {
        if (!fs.existsSync(buildContext.keycloakifyBuildDirPath)) {
            fs.mkdirSync(buildContext.keycloakifyBuildDirPath, {
                recursive: true
            });
        }

        fs.writeFileSync(
            pathJoin(buildContext.keycloakifyBuildDirPath, ".gitignore"),
            Buffer.from("*", "utf8")
        );
    }

    const resourcesDirPath = pathJoin(buildContext.keycloakifyBuildDirPath, "resources");

    await generateResources({
        resourcesDirPath,
        buildContext
    });

    run_post_build_script: {
        if (buildContext.bundler !== "vite") {
            break run_post_build_script;
        }

        child_process.execSync("npx vite", {
            cwd: buildContext.projectDirPath,
            env: {
                ...process.env,
                [VITE_PLUGIN_SUB_SCRIPTS_ENV_NAMES.RUN_POST_BUILD_SCRIPT]: JSON.stringify(
                    {
                        resourcesDirPath,
                        buildContext
                    }
                )
            }
        });
    }

    await buildJars({
        resourcesDirPath,
        buildContext
    });

    rmSync(resourcesDirPath, { recursive: true });

    console.log(
        chalk.green(
            `✓ keycloak theme built in ${((Date.now() - startTime) / 1000).toFixed(2)}s`
        )
    );
}
