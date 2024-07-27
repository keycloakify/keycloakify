import * as child_process from "child_process";
import { copyKeycloakResourcesToStorybookStaticDir } from "./copyKeycloakResourcesToStorybookStaticDir";

(async () => {
    run("yarn build");

    await copyKeycloakResourcesToStorybookStaticDir();

    run("npx build-storybook");
})();

function run(command: string, options?: { env?: NodeJS.ProcessEnv }) {
    console.log(`$ ${command}`);

    child_process.execSync(command, { stdio: "inherit", ...options });
}
