import * as fs from "fs";
import { join } from "path";
import { startRebuildOnSrcChange } from "./shared/startRebuildOnSrcChange";
import { crawl } from "../src/bin/tools/crawl";
import { run } from "./shared/run";

{
    const dirPath = "node_modules";

    try {
        fs.rmSync(dirPath, { recursive: true, force: true });
    } catch {
        // NOTE: This is a workaround for windows
        // we can't remove locked executables.

        crawl({
            dirPath,
            returnedPathsType: "absolute"
        }).forEach(filePath => {
            try {
                fs.rmSync(filePath, { force: true });
            } catch (error) {
                if (filePath.endsWith(".exe")) {
                    return;
                }
                throw error;
            }
        });
    }
}

fs.rmSync("dist", { recursive: true, force: true });
fs.rmSync(".yarn_home", { recursive: true, force: true });

run("yarn install");
run("yarn build");

const starterName = "keycloakify-starter";

fs.rmSync(join("..", starterName, "node_modules"), {
    recursive: true,
    force: true
});

run("yarn install", { cwd: join("..", starterName) });

run(`npx tsx ${join("scripts", "link-in-app.ts")} ${starterName}`);

startRebuildOnSrcChange();
