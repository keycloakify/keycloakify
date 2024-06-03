import * as child_process from "child_process";
import * as fs from "fs";
import { join } from "path";
import { startRebuildOnSrcChange } from "./startRebuildOnSrcChange";

run("yarn build");

run(`node ${join("dist", "bin", "main.js")} copy-keycloak-resources-to-public`, {
    env: {
        ...process.env,
        PUBLIC_DIR_PATH: join(".storybook", "static")
    }
});

{
    const child = child_process.spawn("npx", ["start-storybook", "-p", "6006"]);

    child.stdout.on("data", data => process.stdout.write(data));

    child.stderr.on("data", data => process.stderr.write(data));

    child.on("exit", process.exit.bind(process));
}

startRebuildOnSrcChange();

function run(command: string, options?: { env?: NodeJS.ProcessEnv }) {
    console.log(`$ ${command}`);

    child_process.execSync(command, { stdio: "inherit", ...options });
}
