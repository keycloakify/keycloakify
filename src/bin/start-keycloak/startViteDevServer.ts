import * as child_process from "child_process";
import { assert } from "tsafe/assert";
import type { BuildContext } from "../shared/buildContext";
import chalk from "chalk";
import { VITE_PLUGIN_SUB_SCRIPTS_ENV_NAMES } from "../shared/constants";
import { Deferred } from "evt/tools/Deferred";

export type BuildContextLike = {
    projectDirPath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export function startViteDevServer(params: {
    buildContext: BuildContextLike;
}): Promise<{ port: number }> {
    const { buildContext } = params;

    console.log(chalk.blue(`$ npx vite dev`));

    const child = child_process.spawn("npx", ["vite", "dev"], {
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

    const dPort = new Deferred<number>();

    {
        const onData = (data: Buffer) => {
            //Local:   http://localhost:8083/
            const match = data
                .toString("utf8")
                .match(/Local:\s*http:\/\/(?:localhost|127\.0\.0\.1):(\d+)\//);

            if (match === null) {
                return;
            }

            child.stdout.off("data", onData);

            const port = parseInt(match[1]);

            assert(!isNaN(port));

            dPort.resolve(port);
        };

        child.stdout.on("data", onData);
    }

    return dPort.pr.then(port => ({ port }));
}
