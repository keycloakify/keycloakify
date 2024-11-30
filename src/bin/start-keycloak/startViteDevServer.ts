import * as child_process from "child_process";
import { assert } from "tsafe/assert";
import type { BuildContext } from "../shared/buildContext";
import chalk from "chalk";
import { VITE_PLUGIN_SUB_SCRIPTS_ENV_NAMES } from "../shared/constants";

export type BuildContextLike = {
    projectDirPath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export function startViteDevServer(params: {
    buildContext: BuildContextLike;
    port: number;
}): void {
    const { buildContext, port } = params;

    console.log(chalk.blue(`$ npx vite dev --port ${port}`));

    const child = child_process.spawn("npx", ["vite", "dev", "--port", `${port}`], {
        cwd: buildContext.projectDirPath,
        env: {
            ...process.env,
            [VITE_PLUGIN_SUB_SCRIPTS_ENV_NAMES.READ_KC_CONTEXT_FROM_URL]: "true"
        },
        shell: true
    });

    child.stdout.on("data", data => {
        if (!data.toString("utf8").includes("[vite] hmr")) {
            return;
        }

        process.stdout.write(data);
    });

    child.stderr.on("data", data => process.stderr.write(data));
}
