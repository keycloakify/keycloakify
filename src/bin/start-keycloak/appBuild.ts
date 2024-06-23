import * as child_process from "child_process";
import { Deferred } from "evt/tools/Deferred";
import { assert } from "tsafe/assert";
import type { BuildContext } from "../shared/buildContext";
import chalk from "chalk";
import { sep as pathSep, join as pathJoin } from "path";

export type BuildContextLike = {
    projectDirPath: string;
    keycloakifyBuildDirPath: string;
    bundler: BuildContext["bundler"];
    projectBuildDirPath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export async function appBuild(params: {
    buildContext: BuildContextLike;
}): Promise<{ isAppBuildSuccess: boolean }> {
    const { buildContext } = params;

    switch (buildContext.bundler.type) {
        case "vite":
            return appBuild_vite({ buildContext });
        case "webpack":
            return appBuild_webpack({ buildContext });
    }
}

async function appBuild_vite(params: {
    buildContext: BuildContextLike;
}): Promise<{ isAppBuildSuccess: boolean }> {
    const { buildContext } = params;

    assert(buildContext.bundler.type === "vite");

    const dIsSuccess = new Deferred<boolean>();

    console.log(chalk.blue("Running: 'npx vite build'"));

    const child = child_process.spawn("npx", ["vite", "build"], {
        cwd: buildContext.projectDirPath,
        shell: true
    });

    child.stdout.on("data", data => {
        if (data.toString("utf8").includes("gzip:")) {
            return;
        }

        process.stdout.write(data);
    });

    child.stderr.on("data", data => process.stderr.write(data));

    child.on("exit", code => dIsSuccess.resolve(code === 0));

    const isSuccess = await dIsSuccess.pr;

    return { isAppBuildSuccess: isSuccess };
}

async function appBuild_webpack(params: {
    buildContext: BuildContextLike;
}): Promise<{ isAppBuildSuccess: boolean }> {
    const { buildContext } = params;

    assert(buildContext.bundler.type === "webpack");

    const entries = Object.entries(buildContext.bundler.packageJsonScripts).filter(
        ([, scriptCommand]) => scriptCommand.includes("keycloakify build")
    );

    if (entries.length === 0) {
        console.log(
            chalk.red(
                [
                    `You should have a script in your package.json at ${buildContext.bundler.packageJsonDirPath}`,
                    `that includes the 'keycloakify build' command`
                ].join(" ")
            )
        );
        process.exit(-1);
    }

    const entry =
        entries.length === 1
            ? entries[0]
            : entries.find(([scriptName]) => scriptName === "build-keycloak-theme");

    if (entry === undefined) {
        console.log(
            chalk.red(
                "There's multiple candidate script for building your app, name one 'build-keycloak-theme'"
            )
        );
        process.exit(-1);
    }

    const [scriptName, scriptCommand] = entry;

    const { appBuildSubCommands } = (() => {
        const appBuildSubCommands: string[] = [];

        for (const subCmd of scriptCommand.split("&&").map(s => s.trim())) {
            if (subCmd.includes("keycloakify build")) {
                break;
            }

            appBuildSubCommands.push(subCmd);
        }

        return { appBuildSubCommands };
    })();

    if (appBuildSubCommands.length === 0) {
        console.log(
            chalk.red(
                `Your ${scriptName} script should look like "... && keycloakify build ..."`
            )
        );
        process.exit(-1);
    }

    for (const subCommand of appBuildSubCommands) {
        const dIsSuccess = new Deferred<boolean>();

        console.log(chalk.blue(`Running: '${subCommand}'`));

        const [command, ...args] = subCommand.split(" ");

        const child = child_process.spawn(command, args, {
            cwd: buildContext.bundler.packageJsonDirPath,
            env: {
                ...process.env,
                PATH: (() => {
                    const separator = pathSep === "/" ? ":" : ";";

                    return [
                        pathJoin(
                            buildContext.bundler.packageJsonDirPath,
                            "node_modules",
                            ".bin"
                        ),
                        ...(process.env.PATH ?? "").split(separator)
                    ].join(separator);
                })()
            },
            shell: true
        });

        child.stdout.on("data", data => process.stdout.write(data));

        child.stderr.on("data", data => process.stderr.write(data));

        child.on("exit", code => dIsSuccess.resolve(code === 0));

        const isSuccess = await dIsSuccess.pr;

        if (!isSuccess) {
            return { isAppBuildSuccess: false };
        }
    }

    return { isAppBuildSuccess: true };
}
