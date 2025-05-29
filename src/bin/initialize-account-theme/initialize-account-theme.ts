import type { BuildContext } from "../shared/buildContext";
import cliSelect from "cli-select";
import chalk from "chalk";
import { join as pathJoin, relative as pathRelative } from "path";
import * as fs from "fs";
import { updateAccountThemeImplementationInConfig } from "./updateAccountThemeImplementationInConfig";
import { maybeDelegateCommandToCustomHandler } from "../shared/customHandler_delegate";
import { exitIfUncommittedChanges } from "../shared/exitIfUncommittedChanges";
import { getThisCodebaseRootDirPath } from "../tools/getThisCodebaseRootDirPath";

export async function command(params: { buildContext: BuildContext }) {
    const { buildContext } = params;

    const { hasBeenHandled } = await maybeDelegateCommandToCustomHandler({
        commandName: "initialize-account-theme",
        buildContext
    });

    if (hasBeenHandled) {
        return;
    }

    const accountThemeSrcDirPath = pathJoin(buildContext.themeSrcDirPath, "account");

    exitIfUncommittedChanges({
        projectDirPath: buildContext.projectDirPath
    });

    const { value: accountThemeType } = await cliSelect({
        values: ["Single-Page" as const, "Multi-Page" as const]
    }).catch(() => {
        process.exit(-1);
    });

    switch (accountThemeType) {
        case "Multi-Page":
            {
                if (
                    fs.existsSync(accountThemeSrcDirPath) &&
                    fs.readdirSync(accountThemeSrcDirPath).length > 0
                ) {
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

                updateAccountThemeImplementationInConfig({
                    buildContext,
                    accountThemeType
                });

                fs.cpSync(
                    pathJoin(
                        getThisCodebaseRootDirPath(),
                        "src",
                        "bin",
                        "initialize-account-theme",
                        "multi-page-boilerplate"
                    ),
                    accountThemeSrcDirPath,
                    { recursive: true }
                );
            }
            break;
        case "Single-Page":
            {
                updateAccountThemeImplementationInConfig({
                    buildContext,
                    accountThemeType
                });

                const { initializeSpa } = await import("../shared/initializeSpa");

                await initializeSpa({
                    themeType: "account",
                    buildContext
                });
            }
            break;
    }
}
