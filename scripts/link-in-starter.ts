import * as child_process from "child_process";
import * as fs from "fs";
import { join } from "path";

fs.rmSync("node_modules", { "recursive": true, "force": true });
fs.rmSync("dist", { "recursive": true, "force": true });
fs.rmSync(".yarn_home", { "recursive": true, "force": true });

run("yarn install");
run("yarn build");

fs.rmSync(join("..", "keycloakify-starter", "node_modules"), { "recursive": true, "force": true });

run("yarn install", { "cwd": join("..", "keycloakify-starter") });

run(`npx ts-node --skipProject ${join("scripts", "link-in-app.ts")} keycloakify-starter`);

run(`npx chokidar '${join("src", "**", "*")}' -c 'yarn build'`);

function run(command: string, options?: { cwd: string }) {
    console.log(`$ ${command}`);

    child_process.execSync(command, { "stdio": "inherit", ...options });
}
