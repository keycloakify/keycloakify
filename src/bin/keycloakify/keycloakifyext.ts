import type { CliCommandOptions } from "../main";
import { getBuildContext } from "../shared/buildContext";
import chalk from "chalk";
import { readThisNpmPackageVersion } from "../tools/readThisNpmPackageVersion";
import { join as pathJoin, relative as pathRelative, sep as pathSep } from "path";
import fs from "fs";
import child_process from "child_process";
import { VITE_PLUGIN_SUB_SCRIPTS_ENV_NAMES } from "../shared/constants";
import { generateResources } from "./generateResources";

export async function command(params: { cliCommandOptions: CliCommandOptions }) {
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

    console.log(
        chalk.green(
            `✓ keycloak theme built in ${((Date.now() - startTime) / 1000).toFixed(2)}s`
        )
    );
}
