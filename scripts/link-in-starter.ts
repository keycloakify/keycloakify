import * as fs from "fs";
import { join as pathJoin, sep as pathSep } from "path";
import { run } from "./shared/run";
import cliSelect from "cli-select";
import { getThisCodebaseRootDirPath } from "../src/bin/tools/getThisCodebaseRootDirPath";
import chalk from "chalk";
import { removeNodeModules } from "./tools/removeNodeModules";
import { startRebuildOnSrcChange } from "./shared/startRebuildOnSrcChange";

(async () => {
    const parentDirPath = pathJoin(getThisCodebaseRootDirPath(), "..");

    const { starterName } = await (async () => {
        const starterNames = fs
            .readdirSync(parentDirPath)
            .filter(
                basename =>
                    basename.includes("starter") &&
                    basename.includes("keycloakify") &&
                    fs.statSync(pathJoin(parentDirPath, basename)).isDirectory()
            );

        if (starterNames.length === 0) {
            console.log(
                chalk.red(
                    `No starter found. Keycloakify Angular starter found in ${parentDirPath}`
                )
            );
            process.exit(-1);
        }

        const starterName = await (async () => {
            if (starterNames.length === 1) {
                return starterNames[0];
            }

            console.log(chalk.cyan(`\nSelect a starter to link in:`));

            const { value } = await cliSelect<string>({
                values: starterNames.map(starterName => `..${pathSep}${starterName}`)
            }).catch(() => {
                process.exit(-1);
            });

            return value.split(pathSep)[1];
        })();

        return { starterName };
    })();

    const startTime = Date.now();

    console.log(chalk.cyan(`\n\nLinking in ..${pathSep}${starterName}...`));

    removeNodeModules({
        nodeModulesDirPath: pathJoin(getThisCodebaseRootDirPath(), "node_modules")
    });

    fs.rmSync(pathJoin(getThisCodebaseRootDirPath(), "dist"), {
        recursive: true,
        force: true
    });
    fs.rmSync(pathJoin(getThisCodebaseRootDirPath(), ".yarn_home"), {
        recursive: true,
        force: true
    });

    run("yarn install");
    run("yarn build");

    const starterDirPath = pathJoin(parentDirPath, starterName);

    removeNodeModules({
        nodeModulesDirPath: pathJoin(starterDirPath, "node_modules")
    });

    run("yarn install", { cwd: starterDirPath });

    run(`npx tsx ${pathJoin("scripts", "link-in-app.ts")} ${starterName}`);

    const durationSeconds = Math.round((Date.now() - startTime) / 1000);

    await new Promise(resolve => setTimeout(resolve, 1000));

    startRebuildOnSrcChange();

    console.log(chalk.green(`\n\nLinked in ${starterName} in ${durationSeconds}s`));
})();
