import { generateSrcMainResources } from "./generateSrcMainResources";
import { join as pathJoin, relative as pathRelative, sep as pathSep } from "path";
import * as child_process from "child_process";
import * as fs from "fs";
import { readBuildOptions } from "../shared/buildOptions";
import { vitePluginSubScriptEnvNames } from "../shared/constants";
import { buildJars } from "./buildJars";
import type { CliCommandOptions } from "../main";
import chalk from "chalk";
import { readThisNpmPackageVersion } from "../tools/readThisNpmPackageVersion";

export async function command(params: { cliCommandOptions: CliCommandOptions }) {
    const { cliCommandOptions } = params;

    const buildOptions = readBuildOptions({ cliCommandOptions });

    console.log(
        [
            chalk.cyan(`keycloakify v${readThisNpmPackageVersion()}`),
            chalk.green(`Building the keycloak theme in .${pathSep}${pathRelative(process.cwd(), buildOptions.keycloakifyBuildDirPath)} ...`)
        ].join(" ")
    );

    const startTime = Date.now();

    {
        if (!fs.existsSync(buildOptions.keycloakifyBuildDirPath)) {
            fs.mkdirSync(buildOptions.keycloakifyBuildDirPath, { "recursive": true });
        }

        fs.writeFileSync(pathJoin(buildOptions.keycloakifyBuildDirPath, ".gitignore"), Buffer.from("*", "utf8"));
    }

    await generateSrcMainResources({ buildOptions });

    run_post_build_script: {
        if (buildOptions.bundler !== "vite") {
            break run_post_build_script;
        }

        child_process.execSync("npx vite", {
            "cwd": buildOptions.reactAppRootDirPath,
            "env": {
                ...process.env,
                [vitePluginSubScriptEnvNames.runPostBuildScript]: JSON.stringify(buildOptions)
            }
        });
    }

    await buildJars({ buildOptions });

    console.log(chalk.green(`✓ built in ${((Date.now() - startTime) / 1000).toFixed(2)}s`));
}
