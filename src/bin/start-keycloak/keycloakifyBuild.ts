import { onlyBuildJarFileBasenameEnvName } from "../shared/constants";
import * as child_process from "child_process";
import { Deferred } from "evt/tools/Deferred";
import { assert } from "tsafe/assert";
import type { BuildContext } from "../shared/buildContext";

export type BuildContextLike = {
    projectDirPath: string;
    keycloakifyBuildDirPath: string;
    bundler: "vite" | "webpack";
    npmWorkspaceRootDirPath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export async function keycloakifyBuild(params: {
    onlyBuildJarFileBasename: string | undefined;
    buildContext: BuildContextLike;
}): Promise<{ isKeycloakifyBuildSuccess: boolean }> {
    const { buildContext, onlyBuildJarFileBasename } = params;

    const dResult = new Deferred<{ isSuccess: boolean }>();

    const child = child_process.spawn("npx", ["keycloakify", "build"], {
        cwd: buildContext.projectDirPath,
        env: {
            ...process.env,
            [onlyBuildJarFileBasenameEnvName]: onlyBuildJarFileBasename
        }
    });

    child.stdout.on("data", data => process.stdout.write(data));

    child.stderr.on("data", data => process.stderr.write(data));

    child.on("exit", code => dResult.resolve({ isSuccess: code === 0 }));

    const { isSuccess } = await dResult.pr;

    return { isKeycloakifyBuildSuccess: isSuccess };
}
