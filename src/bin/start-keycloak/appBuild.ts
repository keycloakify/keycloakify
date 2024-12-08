import * as child_process from "child_process";
import { Deferred } from "evt/tools/Deferred";
import { assert, is, type Equals } from "tsafe/assert";
import { id } from "tsafe/id";
import type { BuildContext } from "../shared/buildContext";
import chalk from "chalk";
import { sep as pathSep, join as pathJoin } from "path";
import { getAbsoluteAndInOsFormatPath } from "../tools/getAbsoluteAndInOsFormatPath";
import * as fs from "fs";
import { dirname as pathDirname, relative as pathRelative } from "path";
import { z } from "zod";

export type BuildContextLike = {
    projectDirPath: string;
    packageJsonFilePath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export async function appBuild(params: {
    buildContext: BuildContextLike;
}): Promise<{ isAppBuildSuccess: boolean }> {
    const { buildContext } = params;

    const { parsedPackageJson } = (() => {
        type ParsedPackageJson = {
            scripts?: Record<string, string>;
        };

        const zParsedPackageJson = (() => {
            type TargetType = ParsedPackageJson;

            const zTargetType = z.object({
                scripts: z.record(z.string()).optional()
            });

            assert<Equals<z.infer<typeof zTargetType>, TargetType>>();

            return id<z.ZodType<TargetType>>(zTargetType);
        })();
        const parsedPackageJson = JSON.parse(
            fs.readFileSync(buildContext.packageJsonFilePath).toString("utf8")
        );

        zParsedPackageJson.parse(parsedPackageJson);

        assert(is<ParsedPackageJson>(parsedPackageJson));

        return { parsedPackageJson };
    })();

    const entries = Object.entries(parsedPackageJson.scripts ?? {}).filter(
        ([, scriptCommand]) => scriptCommand.includes("keycloakify build")
    );

    if (entries.length === 0) {
        console.log(
            chalk.red(
                [
                    `You should have a script in your package.json at ${pathRelative(process.cwd(), pathDirname(buildContext.packageJsonFilePath))}`,
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

    common_case: {
        if (appBuildSubCommands.length !== 1) {
            break common_case;
        }

        const [appBuildSubCommand] = appBuildSubCommands;

        const isNpmRunBuild = (() => {
            for (const packageManager of ["npm", "yarn", "pnpm", "bun", "deno"]) {
                for (const doUseRun of [true, false]) {
                    if (
                        `${packageManager}${doUseRun ? " run " : " "}build` ===
                        appBuildSubCommand
                    ) {
                        return true;
                    }
                }
            }

            return false;
        })();

        if (!isNpmRunBuild) {
            break common_case;
        }

        const { scripts } = parsedPackageJson;

        assert(scripts !== undefined);

        const buildCmd = scripts.build;

        if (buildCmd !== "tsc && vite build") {
            break common_case;
        }

        if (scripts.prebuild !== undefined) {
            break common_case;
        }

        if (scripts.postbuild !== undefined) {
            break common_case;
        }

        const dIsSuccess = new Deferred<boolean>();

        console.log(chalk.blue("$ npx vite build"));

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

    let commandCwd = pathDirname(buildContext.packageJsonFilePath);

    for (const subCommand of appBuildSubCommands) {
        const dIsSuccess = new Deferred<boolean>();

        const [command, ...args] = subCommand.split(" ");

        if (command === "cd") {
            const [pathIsh] = args;

            commandCwd = getAbsoluteAndInOsFormatPath({
                pathIsh,
                cwd: commandCwd
            });

            continue;
        }

        console.log(chalk.blue(`$ ${subCommand}`));

        const child = child_process.spawn(command, args, {
            cwd: commandCwd,
            env: {
                ...process.env,
                PATH: (() => {
                    const separator = pathSep === "/" ? ":" : ";";

                    return [
                        pathJoin(
                            pathDirname(buildContext.packageJsonFilePath),
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
