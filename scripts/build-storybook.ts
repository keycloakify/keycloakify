import * as child_process from "child_process";

(async () => {
    run("yarn build");
    run("npx build-storybook");
})();

function run(command: string, options?: { env?: NodeJS.ProcessEnv }) {
    console.log(`$ ${command}`);

    child_process.execSync(command, { stdio: "inherit", ...options });
}
