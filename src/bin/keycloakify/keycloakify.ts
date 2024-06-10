import { generateSrcMainResources } from "./generateSrcMainResources";
import { join as pathJoin, relative as pathRelative, sep as pathSep } from "path";
import * as child_process from "child_process";
import * as fs from "fs";
import { getBuildContext } from "../shared/buildContext";
import { vitePluginSubScriptEnvNames, skipBuildJarsEnvName } from "../shared/constants";
import { buildJars } from "./buildJars";
import type { CliCommandOptions } from "../main";
import chalk from "chalk";
import { readThisNpmPackageVersion } from "../tools/readThisNpmPackageVersion";
import * as os from "os";
import { rmSync } from "../tools/fs.rmSync";

export async function command(params: { cliCommandOptions: CliCommandOptions }) {
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

        process.exit(1);
    }

    const { cliCommandOptions } = params;

    const buildContext = getBuildContext({ cliCommandOptions });

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

    await generateSrcMainResources({
        resourcesDirPath,
        buildContext
    });

    run_post_build_script: {
        if (buildContext.bundler !== "vite") {
            break run_post_build_script;
        }

        child_process.execSync("npx vite", {
            cwd: resourcesDirPath,
            env: {
                ...process.env,
                [vitePluginSubScriptEnvNames.runPostBuildScript]:
                    JSON.stringify(buildContext)
            }
        });
    }

    build_jars: {
        if (process.env[skipBuildJarsEnvName]) {
            break build_jars;
        }

        await buildJars({ resourcesDirPath, buildContext });
    }

    if (Date.now() === 0) {
        rmSync(resourcesDirPath, { recursive: true });
    }

    console.log(
        chalk.green(`✓ built in ${((Date.now() - startTime) / 1000).toFixed(2)}s`)
    );
}
