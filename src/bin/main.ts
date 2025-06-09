#!/usr/bin/env node

import { termost } from "termost";
import { readThisNpmPackageVersion } from "./tools/readThisNpmPackageVersion";
import * as child_process from "child_process";
import { assertNoPnpmDlx } from "./tools/assertNoPnpmDlx";
import { getBuildContext } from "./shared/buildContext";

type CliCommandOptions = {
    projectDirPath: string | undefined;
};

assertNoPnpmDlx();

const program = termost<CliCommandOptions>(
    {
        name: "keycloakify",
        description: "Keycloakify CLI",
        version: readThisNpmPackageVersion()
    },
    {
        onException: error => {
            console.error(error);
            process.exit(1);
        }
    }
);

const optionsKeys: string[] = [];

program.option({
    key: "projectDirPath",
    name: (() => {
        const long = "project";
        const short = "p";

        optionsKeys.push(long, short);

        return { long, short };
    })(),
    description: [
        `For monorepos, path to the keycloakify project.`,
        "Example: `npx keycloakify build --project packages/keycloak-theme`",
        "https://docs.keycloakify.dev/build-options#project-or-p-cli-option"
    ].join(" "),
    defaultValue: undefined
});

function skip(_context: any, argv: { options: Record<string, unknown> }) {
    const unrecognizedOptionKey = Object.keys(argv.options).find(
        key => !optionsKeys.includes(key)
    );

    if (unrecognizedOptionKey !== undefined) {
        console.error(
            `keycloakify: Unrecognized option: ${
                unrecognizedOptionKey.length === 1 ? "-" : "--"
            }${unrecognizedOptionKey}`
        );
        process.exit(1);
    }

    return false;
}

program
    .command({
        name: "build",
        description: "Build the theme (default subcommand)."
    })
    .task({
        skip,
        handler: async ({ projectDirPath }) => {
            const { command } = await import("./keycloakify");

            await command({ buildContext: getBuildContext({ projectDirPath }) });
        }
    });

program
    .command<{
        port: number | undefined;
        keycloakVersion: string | number | undefined;
        realmJsonFilePath: string | undefined;
    }>({
        name: "start-keycloak",
        description:
            "Spin up a pre configured Docker image of Keycloak to test your theme."
    })
    .option({
        key: "port",
        name: (() => {
            const name = "port";

            optionsKeys.push(name);

            return name;
        })(),
        description: ["Keycloak server port.", "Example `--port 8085`"].join(" "),
        defaultValue: undefined
    })
    .option({
        key: "keycloakVersion",
        name: (() => {
            const name = "keycloak-version";

            optionsKeys.push(name);

            return name;
        })(),
        description: [
            "Use a specific version of Keycloak.",
            "Example `--keycloak-version 21.1.1`"
        ].join(" "),
        defaultValue: undefined
    })
    .option({
        key: "realmJsonFilePath",
        name: (() => {
            const name = "import";

            optionsKeys.push(name);

            return name;
        })(),
        defaultValue: undefined,
        description: [
            "Import your own realm configuration file",
            "Example `--import path/to/myrealm-realm.json`"
        ].join(" ")
    })
    .task({
        skip,
        handler: async ({ projectDirPath, keycloakVersion, port, realmJsonFilePath }) => {
            const { command } = await import("./start-keycloak");

            await command({
                buildContext: getBuildContext({ projectDirPath }),
                cliCommandOptions: {
                    keycloakVersion:
                        keycloakVersion === undefined ? undefined : `${keycloakVersion}`,
                    port,
                    realmJsonFilePath
                }
            });
        }
    });

program
    .command({
        name: "init",
        description: "(BETA) Initialize a new theme type (login/account/admin/email)"
    })
    .task({
        skip,
        handler: async ({ projectDirPath }) => {
            const { command } = await import("./init");

            await command({ projectDirPath: projectDirPath ?? process.cwd() });
        }
    });

program
    .command({
        name: "eject-page",
        description: "Eject a Keycloak page."
    })
    .task({
        skip,
        handler: async ({ projectDirPath }) => {
            const { command } = await import("./eject-page");

            await command({ buildContext: getBuildContext({ projectDirPath }) });
        }
    });

program
    .command({
        name: "add-story",
        description: "Add *.stories.tsx file for a specific page to in your Storybook."
    })
    .task({
        skip,
        handler: async ({ projectDirPath }) => {
            const { command } = await import("./add-story");

            await command({ buildContext: getBuildContext({ projectDirPath }) });
        }
    });

program
    .command({
        name: "initialize-email-theme",
        description: "Initialize an email theme."
    })
    .task({
        skip,
        handler: async ({ projectDirPath }) => {
            const { command } = await import("./initialize-email-theme");

            await command({ buildContext: getBuildContext({ projectDirPath }) });
        }
    });

program
    .command({
        name: "initialize-account-theme",
        description: "Initialize an Account Single-Page or Multi-Page custom Account UI."
    })
    .task({
        skip,
        handler: async ({ projectDirPath }) => {
            const { command } = await import("./initialize-account-theme");

            await command({ buildContext: getBuildContext({ projectDirPath }) });
        }
    });

program
    .command({
        name: "initialize-admin-theme",
        description: "Initialize an Admin Console custom UI."
    })
    .task({
        skip,
        handler: async ({ projectDirPath }) => {
            const { command } = await import("./initialize-admin-theme");

            await command({ buildContext: getBuildContext({ projectDirPath }) });
        }
    });

program
    .command({
        name: "copy-keycloak-resources-to-public",
        description:
            "(Internal) Copy Keycloak default theme resources to the public directory."
    })
    .task({
        skip,
        handler: async ({ projectDirPath }) => {
            const { command } = await import("./copy-keycloak-resources-to-public");

            await command({ buildContext: getBuildContext({ projectDirPath }) });
        }
    });

program
    .command({
        name: "update-kc-gen",
        description:
            "(Webpack/Create-React-App only) Create/update the kc.gen.ts file in your project."
    })
    .task({
        skip,
        handler: async ({ projectDirPath }) => {
            const { command } = await import("./update-kc-gen");

            await command({ buildContext: getBuildContext({ projectDirPath }) });
        }
    });

program
    .command({
        name: "sync-extensions",
        description: [
            "Synchronizes all installed Keycloakify extension modules with your project.",
            "",
            "Example of extension modules: '@keycloakify/keycloak-account-ui', '@keycloakify/keycloak-admin-ui', '@keycloakify/keycloak-ui-shared'",
            "",
            "This command ensures that:",
            "- All required files from installed extensions are copied into your project.",
            "- The copied files are correctly ignored by Git to help you distinguish between your custom source files",
            "  and those provided by the extensions.",
            "- Peer dependencies declared by the extensions are automatically added to your package.json.",
            "",
            "You can safely run this command multiple times. It will only update the files and dependencies if needed,",
            "ensuring your project stays in sync with the installed extensions.",
            "",
            "Typical usage:",
            "- Should be run as a postinstall script of your project.",
            ""
        ].join("\n")
    })
    .task({
        skip,
        handler: async ({ projectDirPath }) => {
            const { command } = await import("./sync-extensions");

            await command({ buildContext: getBuildContext({ projectDirPath }) });
        }
    });

program
    .command<{
        path: string;
        revert: boolean;
        public: boolean;
    }>({
        name: "own",
        description: [
            "Manages ownership of auto-generated files provided by Keycloakify extensions.",
            "",
            "This command allows you to take ownership of a specific file or directory generated",
            "by an extension. Once owned, you can freely modify and version-control the file.",
            "",
            "You can also use the --revert flag to relinquish ownership and restore the file",
            "or directory to its original auto-generated state.",
            "",
            "For convenience, the exact command to take ownership of any file is included as a comment",
            "in the header of each extension-generated file.",
            "",
            "Examples:",
            "$ npx keycloakify own --path admin/KcPage.tsx"
        ].join("\n")
    })
    .option({
        key: "path",
        name: (() => {
            const long = "path";
            const short = "t";

            optionsKeys.push(long, short);

            return { long, short };
        })(),
        description: [
            "Specifies the relative path of the file or directory to take ownership of.",
            "This path should be relative to your theme directory.",
            "Example: `--path 'admin/KcPage.tsx'`"
        ].join(" ")
    })
    .option({
        key: "revert",
        name: (() => {
            const long = "revert";
            const short = "r";

            optionsKeys.push(long, short);

            return { long, short };
        })(),
        description: [
            "Restores a file or directory to its original auto-generated state,",
            "removing your ownership claim and reverting any modifications."
        ].join(" "),
        defaultValue: false
    })
    .option({
        key: "public",
        name: (() => {
            const long = "public";
            const short = "p";

            optionsKeys.push(long, short);

            return { long, short };
        })(),
        description: [
            "Flag to use when targeting a file or directory in the public directory",
            "instead of the src"
        ].join(" "),
        defaultValue: false
    })
    .task({
        skip,
        handler: async ({ projectDirPath, path, revert, public: public_params }) => {
            const { command } = await import("./own");

            await command({
                buildContext: getBuildContext({ projectDirPath }),
                cliCommandOptions: { path, isRevert: revert, isPublic: public_params }
            });
        }
    });

// Fallback to build command if no command is provided
{
    const [, , ...rest] = process.argv;

    if (
        rest.length === 0 ||
        (rest[0].startsWith("-") && rest[0] !== "--help" && rest[0] !== "-h")
    ) {
        const { status } = child_process.spawnSync(
            "npx",
            ["keycloakify", "build", ...rest],
            {
                stdio: "inherit"
            }
        );

        process.exit(status ?? 1);
    }
}
