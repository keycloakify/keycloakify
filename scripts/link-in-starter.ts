import * as child_process from "child_process";
import * as fs from "fs";
import { join } from "path";
import { waitForDebounceFactory } from "powerhooks/tools/waitForDebounce";
import chokidar from "chokidar";
import * as runExclusive from "run-exclusive";
import { Deferred } from "evt/tools/Deferred";
import chalk from "chalk";

fs.rmSync("node_modules", { recursive: true, force: true });
fs.rmSync("dist", { recursive: true, force: true });
fs.rmSync(".yarn_home", { recursive: true, force: true });

run("yarn install");
run("yarn build");

fs.rmSync(join("..", "keycloakify-starter", "node_modules"), {
    recursive: true,
    force: true
});

run("yarn install", { cwd: join("..", "keycloakify-starter") });

run(`npx ts-node --skipProject ${join("scripts", "link-in-app.ts")} keycloakify-starter`);

const { waitForDebounce } = waitForDebounceFactory({ delay: 400 });

const runYarnBuild = runExclusive.build(async () => {
    console.log(chalk.green("Running `yarn build`"));

    const dCompleted = new Deferred<void>();

    const child = child_process.spawn("yarn", ["build"], {
        env: process.env
    });

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

function run(command: string, options?: { cwd: string }) {
    console.log(`$ ${command}`);

    child_process.execSync(command, { stdio: "inherit", ...options });
}
