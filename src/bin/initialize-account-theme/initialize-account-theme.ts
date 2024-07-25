import { getBuildContext } from "../shared/buildContext";
import type { CliCommandOptions } from "../main";
import cliSelect from "cli-select";
import child_process from "child_process";
import chalk from "chalk";
import { join as pathJoin, relative as pathRelative } from "path";
import * as fs from "fs";
import { updateAccountThemeImplementationInConfig } from "./updateAccountThemeImplementationInConfig";

export async function command(params: { cliCommandOptions: CliCommandOptions }) {
    const { cliCommandOptions } = params;

    const buildContext = getBuildContext({ cliCommandOptions });

    const accountThemeSrcDirPath = pathJoin(buildContext.themeSrcDirPath, "account");

    if (fs.existsSync(accountThemeSrcDirPath)) {
        console.warn(
            chalk.red(
                `There is already a ${pathRelative(
                    process.cwd(),
                    accountThemeSrcDirPath
                )} directory in your project. Aborting.`
            )
        );

        process.exit(-1);
    }

    exit_if_uncommitted_changes: {
        let hasUncommittedChanges: boolean | undefined = undefined;

        try {
            hasUncommittedChanges =
                child_process
                    .execSync(`git status --porcelain`, {
                        cwd: buildContext.projectDirPath
                    })
                    .toString()
                    .trim() !== "";
        } catch {
            // Probably not a git repository
            break exit_if_uncommitted_changes;
        }

        if (!hasUncommittedChanges) {
            break exit_if_uncommitted_changes;
        }
        console.warn(
            [
                chalk.red(
                    "Please commit or stash your changes before running this command.\n"
                ),
                "This command will modify your project's files so it's better to have a clean working directory",
                "so that you can easily see what has been changed and revert if needed."
            ].join(" ")
        );

        process.exit(-1);
    }

    const { value: accountThemeType } = await cliSelect({
        values: ["Single-Page" as const, "Multi-Page" as const]
    }).catch(() => {
        process.exit(-1);
    });

    switch (accountThemeType) {
        case "Multi-Page":
            {
                const { initializeAccountTheme_multiPage } = await import(
                    "./initializeAccountTheme_multiPage"
                );

                await initializeAccountTheme_multiPage({
                    accountThemeSrcDirPath
                });
            }
            break;
        case "Single-Page":
            {
                const { initializeAccountTheme_singlePage } = await import(
                    "./initializeAccountTheme_singlePage"
                );

                await initializeAccountTheme_singlePage({
                    accountThemeSrcDirPath,
                    buildContext
                });
            }
            break;
    }

    updateAccountThemeImplementationInConfig({ buildContext, accountThemeType });
}
