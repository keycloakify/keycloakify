#!/usr/bin/env node

import { termost } from "termost";
import { readThisNpmPackageVersion } from "./tools/readThisNpmPackageVersion";
import * as child_process from "child_process";

export type CliCommandOptions = {
    reactAppRootDirPath: string | undefined;
};

const program = termost<CliCommandOptions>(
    {
        "name": "keycloakify",
        "description": "Keycloakify CLI",
        "version": readThisNpmPackageVersion()
    },
    {
        "onException": error => {
            console.error(error);
            process.exit(1);
        }
    }
);

const optionsKeys: string[] = [];

program.option({
    "key": "reactAppRootDirPath",
    "name": (() => {
        const long = "project";
        const short = "p";

        optionsKeys.push(long, short);

        return { long, short };
    })(),
    "description": [
        `For monorepos, path to the keycloakify project.`,
        "Example: `npx keycloakify build --project packages/keycloak-theme`",
        "https://docs.keycloakify.dev/build-options#project-or-p-cli-option"
    ].join(" "),
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

program
    .command({
        "name": "build",
        "description": "Build the theme (default subcommand)."
    })
    .task({
        skip,
        "handler": async cliCommandOptions => {
            const { command } = await import("./keycloakify");

            await command({ cliCommandOptions });
        }
    });

program
    .command<{ port: number; keycloakVersion: string | undefined }>({
        "name": "start-keycloak",
        "description": "Spin up a pre configured Docker image of Keycloak to test your theme."
    })
    .option({
        "key": "port",
        "name": (() => {
            const name = "port";

            optionsKeys.push(name);

            return name;
        })(),
        "description": "Keycloak server port.",
        "defaultValue": 8080
    })
    .option({
        "key": "keycloakVersion",
        "name": (() => {
            const name = "keycloak-version";

            optionsKeys.push(name);

            return name;
        })(),
        "description": "Use a specific version of Keycloak.",
        "defaultValue": undefined
    })
    .task({
        skip,
        "handler": async cliCommandOptions => {
            const { command } = await import("./start-keycloak");

            await command({ cliCommandOptions });
        }
    });

program
    .command({
        "name": "download-builtin-keycloak-theme",
        "description": "Download the built-in Keycloak theme."
    })
    .task({
        skip,
        "handler": async cliCommandOptions => {
            const { command } = await import("./download-builtin-keycloak-theme");

            await command({ cliCommandOptions });
        }
    });

program
    .command({
        "name": "eject-keycloak-page",
        "description": "Eject a Keycloak page."
    })
    .task({
        skip,
        "handler": async cliCommandOptions => {
            const { command } = await import("./eject-keycloak-page");

            await command({ cliCommandOptions });
        }
    });

program
    .command({
        "name": "initialize-email-theme",
        "description": "Initialize an email theme."
    })
    .task({
        skip,
        "handler": async cliCommandOptions => {
            const { command } = await import("./initialize-email-theme");

            await command({ cliCommandOptions });
        }
    });

program
    .command({
        "name": "copy-keycloak-resources-to-public",
        "description": "(Webpack/Create-React-App only) Copy Keycloak default theme resources to the public directory."
    })
    .task({
        skip,
        "handler": async cliCommandOptions => {
            const { command } = await import("./copy-keycloak-resources-to-public");

            await command({ cliCommandOptions });
        }
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
