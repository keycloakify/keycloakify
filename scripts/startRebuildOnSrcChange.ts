import * as child_process from "child_process";
import { waitForDebounceFactory } from "powerhooks/tools/waitForDebounce";
import chokidar from "chokidar";
import * as runExclusive from "run-exclusive";
import { Deferred } from "evt/tools/Deferred";
import chalk from "chalk";

export function startRebuildOnSrcChange() {
    const { waitForDebounce } = waitForDebounceFactory({ delay: 400 });

    const runYarnBuild = runExclusive.build(async () => {
        console.log(chalk.green("Running `yarn build`"));

        const dCompleted = new Deferred<void>();

        const child = child_process.spawn("yarn", ["build"]);

        child.stdout.on("data", data => process.stdout.write(data));

        child.stderr.on("data", data => process.stderr.write(data));

        child.on("exit", () => dCompleted.resolve());

        await dCompleted.pr;

        console.log("\n\n");
    });

    console.log(chalk.green("Watching for changes in src/"));

    chokidar.watch("src", { ignoreInitial: true }).on("all", async () => {
        await waitForDebounce();

        runYarnBuild();
    });
}
