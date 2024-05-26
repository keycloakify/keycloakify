import * as child_process from "child_process";
import { Deferred } from "evt/tools/Deferred";
import { assert } from "tsafe/assert";
import { is } from "tsafe/is";
import type { BuildOptions } from "../shared/buildOptions";
import * as fs from "fs";
import { join as pathJoin } from "path";

export type BuildOptionsLike = {
    reactAppRootDirPath: string;
    keycloakifyBuildDirPath: string;
    bundler: "vite" | "webpack";
    npmWorkspaceRootDirPath: string;
    reactAppBuildDirPath: string;
};

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export async function appBuild(params: {
    doSkipIfReactAppBuildDirExists: boolean;
    buildOptions: BuildOptionsLike;
}): Promise<{ isAppBuildSuccess: boolean }> {
    const { doSkipIfReactAppBuildDirExists, buildOptions } = params;

    if (
        doSkipIfReactAppBuildDirExists &&
        fs.existsSync(buildOptions.reactAppBuildDirPath)
    ) {
        return { isAppBuildSuccess: true };
    }

    const { bundler } = buildOptions;

    const { command, args, cwd } = (() => {
        switch (bundler) {
            case "vite":
                return {
                    command: "npx",
                    args: ["vite", "build"],
                    cwd: buildOptions.reactAppRootDirPath
                };
            case "webpack": {
                for (const dirPath of [
                    buildOptions.reactAppRootDirPath,
                    buildOptions.npmWorkspaceRootDirPath
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

    const child = child_process.spawn(command, args, { cwd });

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
