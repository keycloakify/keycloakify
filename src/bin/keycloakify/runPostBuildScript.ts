import * as child_process from "child_process";
import type { BuildContext } from "../shared/buildContext";
import { VITE_PLUGIN_SUB_SCRIPTS_ENV_NAMES } from "../shared/constants";

/**
 * We can't import the user's `vite.config.ts`, so we re-run `npx vite` with a marker
 * env variable the plugin picks up in `configResolved`. No-op for webpack.
 */
export function runPostBuildScript(params: {
    buildContext: BuildContext;
    resourcesDirPath: string;
}): void {
    const { buildContext, resourcesDirPath } = params;

    if (buildContext.bundler !== "vite") {
        return;
    }

    child_process.execSync("npx vite", {
        cwd: buildContext.projectDirPath,
        env: {
            ...process.env,
            [VITE_PLUGIN_SUB_SCRIPTS_ENV_NAMES.RUN_POST_BUILD_SCRIPT]: JSON.stringify({
                resourcesDirPath,
                buildContext
            })
        }
    });
}
