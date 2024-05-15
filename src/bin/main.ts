#!/usr/bin/env node

import { termost } from "termost";

export type CliCommandOptions = {
    isSilent: boolean;
    reactAppRootDirPath: string | undefined;
};

const program = termost<CliCommandOptions>("keycloakify");

program
    .option({
        "key": "reactAppRootDirPath",
        "name": { "long": "project", "short": "p" },
        "description": "https://docs.keycloakify.dev/build-options#project-or-p-cli-option",
        "defaultValue": undefined
    })
    .option({
        "key": "isSilent",
        "name": "silent",
        "description": "https://docs.keycloakify.dev/build-options#silent",
        "defaultValue": false
    });

program
    .command({
        "name": "build",
        "description": "Build the theme (default subcommand)."
    })
    .task({
        "handler": async cliCommandOptions => {
            const { command } = await import("./keycloakify");
            return command({ cliCommandOptions });
        }
    });

program
    .command({
        "name": "download-builtin-keycloak-theme",
        "description": "Download the built-in Keycloak theme."
    })
    .task({
        "handler": async cliCommandOptions => {
            const { command } = await import("./download-builtin-keycloak-theme");
            return command({ cliCommandOptions });
        }
    });

program
    .command({
        "name": "eject-keycloak-page",
        "description": "Eject a Keycloak page."
    })
    .task({
        "handler": async cliCommandOptions => {
            const { command } = await import("./eject-keycloak-page");
            return command({ cliCommandOptions });
        }
    });

program
    .command({
        "name": "initialize-email-theme",
        "description": "Initialize an email theme."
    })
    .task({
        "handler": async cliCommandOptions => {
            const { command } = await import("./initialize-email-theme");
            return command({ cliCommandOptions });
        }
    });

program
    .command({
        "name": "copy-keycloak-resources-to-public",
        "description": [
            "Copy Keycloak default theme resources to the public directory.",
            "This command is meant to be explicitly used in Webpack projects only."
        ].join("\n")
    })
    .task({
        "handler": async cliCommandOptions => {
            const { command } = await import("./copy-keycloak-resources-to-public");
            return command({ cliCommandOptions });
        }
    });
