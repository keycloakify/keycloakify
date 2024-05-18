#!/usr/bin/env node

import { termost } from "termost";
import * as child_process from "child_process";

export type CliCommandOptions = {
    reactAppRootDirPath: string | undefined;
};

const program = termost<CliCommandOptions>("Keycloak theme builder");

const optionsKeys: string[] = [];

program.option({
    "key": "reactAppRootDirPath",
    "name": (() => {
        const long = "project";
        const short = "p";

        optionsKeys.push(long, short);

        return { long, short };
    })(),
    "description": "https://docs.keycloakify.dev/build-options#project-or-p-cli-option",
    "defaultValue": undefined
});

function skip(_context: any, argv: { options: Record<string, unknown> }) {
    const unrecognizedOptionKey = Object.keys(argv.options).find(key => !optionsKeys.includes(key));

    if (unrecognizedOptionKey !== undefined) {
        console.error(`keycloakify: Unrecognized option: ${unrecognizedOptionKey.length === 1 ? "-" : "--"}${unrecognizedOptionKey}`);
        process.exit(1);
    }

    return false;
}

async function runAndLogErrors(fn: () => Promise<void>) {
    try {
        await fn();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

program
    .command({
        "name": "build",
        "description": "Build the theme (default subcommand)."
    })
    .task({
        skip,
        "handler": cliCommandOptions =>
            runAndLogErrors(async () => {
                const { command } = await import("./keycloakify");

                await runAndLogErrors(() => command({ cliCommandOptions }));
            })
    });

program
    .command({
        "name": "start-keycloak",
        "description": "Spin up a pre configured Docker image of Keycloak to test your theme."
    })
    .task({
        skip,
        "handler": cliCommandOptions =>
            runAndLogErrors(async () => {
                const { command } = await import("./start-keycloak");

                await runAndLogErrors(() => command({ cliCommandOptions }));
            })
    });

program
    .command({
        "name": "download-builtin-keycloak-theme",
        "description": "Download the built-in Keycloak theme."
    })
    .task({
        skip,
        "handler": cliCommandOptions =>
            runAndLogErrors(async () => {
                const { command } = await import("./download-builtin-keycloak-theme");

                await runAndLogErrors(() => command({ cliCommandOptions }));
            })
    });

program
    .command({
        "name": "eject-keycloak-page",
        "description": "Eject a Keycloak page."
    })
    .task({
        skip,
        "handler": cliCommandOptions =>
            runAndLogErrors(async () => {
                const { command } = await import("./eject-keycloak-page");

                await runAndLogErrors(() => command({ cliCommandOptions }));
            })
    });

program
    .command({
        "name": "initialize-email-theme",
        "description": "Initialize an email theme."
    })
    .task({
        skip,
        "handler": cliCommandOptions =>
            runAndLogErrors(async () => {
                const { command } = await import("./initialize-email-theme");

                await runAndLogErrors(() => command({ cliCommandOptions }));
            })
    });

program
    .command({
        "name": "copy-keycloak-resources-to-public",
        "description": "(Webpack/Create-React-App only) Copy Keycloak default theme resources to the public directory."
    })
    .task({
        skip,
        "handler": cliCommandOptions =>
            runAndLogErrors(async () => {
                const { command } = await import("./copy-keycloak-resources-to-public");

                await runAndLogErrors(() => command({ cliCommandOptions }));
            })
    });

// Fallback to build command if no command is provided
{
    const [, , ...rest] = process.argv;

    if (rest.length === 0 || (rest[0].startsWith("-") && rest[0] !== "--help" && rest[0] !== "-h")) {
        const { status } = child_process.spawnSync("npx", ["keycloakify", "build", ...rest], {
            "stdio": "inherit"
        });

        process.exit(status ?? 1);
    }
}
