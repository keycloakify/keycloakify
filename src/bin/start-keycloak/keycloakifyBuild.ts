import { skipBuildJarsEnvName } from "../shared/constants";
import * as child_process from "child_process";
import { Deferred } from "evt/tools/Deferred";
import { assert } from "tsafe/assert";
import type { BuildOptions } from "../shared/buildOptions";

export type BuildOptionsLike = {
    reactAppRootDirPath: string;
    keycloakifyBuildDirPath: string;
    bundler: "vite" | "webpack";
    npmWorkspaceRootDirPath: string;
};

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export async function keycloakifyBuild(params: {
    doSkipBuildJars: boolean;
    buildOptions: BuildOptionsLike;
}): Promise<{ isKeycloakifyBuildSuccess: boolean }> {
    const { buildOptions, doSkipBuildJars } = params;

    const dResult = new Deferred<{ isSuccess: boolean }>();

    const child = child_process.spawn("npx", ["keycloakify", "build"], {
        cwd: buildOptions.reactAppRootDirPath,
        env: {
            ...process.env,
            ...(doSkipBuildJars ? {} : { [skipBuildJarsEnvName]: "true" })
        }
    });

    child.stdout.on("data", data => process.stdout.write(data));

    child.stderr.on("data", data => process.stderr.write(data));

    child.on("exit", code => dResult.resolve({ isSuccess: code === 0 }));

    const { isSuccess } = await dResult.pr;

    return { isKeycloakifyBuildSuccess: isSuccess };
}
