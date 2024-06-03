import * as child_process from "child_process";
import { join } from "path";

run("yarn build");

run(`node ${join("dist", "bin", "main.js")} copy-keycloak-resources-to-public`, {
    env: {
        ...process.env,
        PUBLIC_DIR_PATH: join(".storybook", "static")
    }
});

run("npx build-storybook");

function run(command: string, options?: { env?: NodeJS.ProcessEnv }) {
    console.log(`$ ${command}`);

    child_process.execSync(command, { stdio: "inherit", ...options });
}
