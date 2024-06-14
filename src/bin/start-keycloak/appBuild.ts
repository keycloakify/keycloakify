import * as child_process from "child_process";
import { Deferred } from "evt/tools/Deferred";
import { assert } from "tsafe/assert";
import { is } from "tsafe/is";
import type { BuildContext } from "../shared/buildContext";
import * as fs from "fs";
import { join as pathJoin } from "path";

export type BuildContextLike = {
    projectDirPath: string;
    keycloakifyBuildDirPath: string;
    bundler: "vite" | "webpack";
    npmWorkspaceRootDirPath: string;
    projectBuildDirPath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export async function appBuild(params: {
    buildContext: BuildContextLike;
}): Promise<{ isAppBuildSuccess: boolean }> {
    const { buildContext } = params;

    const { bundler } = buildContext;

    const { command, args, cwd } = (() => {
        switch (bundler) {
            case "vite":
                return {
                    command: "npx",
                    args: ["vite", "build"],
                    cwd: buildContext.projectDirPath
                };
            case "webpack": {
                for (const dirPath of [
                    buildContext.projectDirPath,
                    buildContext.npmWorkspaceRootDirPath
                ]) {
                    try {
                        const parsedPackageJson = JSON.parse(
                            fs
                                .readFileSync(pathJoin(dirPath, "package.json"))
                                .toString("utf8")
                        );

                        const [scriptName] =
                            Object.entries(parsedPackageJson.scripts).find(
                                ([, scriptValue]) => {
                                    assert(is<string>(scriptValue));
                                    if (
                                        scriptValue.includes("webpack") &&
                                        scriptValue.includes("--mode production")
                                    ) {
                                        return true;
                                    }

                                    if (
                                        scriptValue.includes("react-scripts") &&
                                        scriptValue.includes("build")
                                    ) {
                                        return true;
                                    }

                                    if (
                                        scriptValue.includes("react-app-rewired") &&
                                        scriptValue.includes("build")
                                    ) {
                                        return true;
                                    }

                                    if (
                                        scriptValue.includes("craco") &&
                                        scriptValue.includes("build")
                                    ) {
                                        return true;
                                    }

                                    if (
                                        scriptValue.includes("ng") &&
                                        scriptValue.includes("build")
                                    ) {
                                        return true;
                                    }

                                    return false;
                                }
                            ) ?? [];

                        if (scriptName === undefined) {
                            continue;
                        }

                        return {
                            command: "npm",
                            args: ["run", scriptName],
                            cwd: dirPath
                        };
                    } catch {
                        continue;
                    }
                }

                throw new Error(
                    "Keycloakify was unable to determine which script is responsible for building the app."
                );
            }
        }
    })();

    const dResult = new Deferred<{ isSuccess: boolean }>();

    const child = child_process.spawn(command, args, { cwd, shell: true });

    child.stdout.on("data", data => {
        if (data.toString("utf8").includes("gzip:")) {
            return;
        }

        process.stdout.write(data);
    });

    child.stderr.on("data", data => process.stderr.write(data));

    child.on("exit", code => dResult.resolve({ isSuccess: code === 0 }));

    const { isSuccess } = await dResult.pr;

    return { isAppBuildSuccess: isSuccess };
}
