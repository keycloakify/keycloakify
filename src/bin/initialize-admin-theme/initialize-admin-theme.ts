import type { BuildContext } from "../shared/buildContext";
import chalk from "chalk";
import { join as pathJoin, relative as pathRelative } from "path";
import * as fs from "fs";
import { command as updateKcGenCommand } from "../update-kc-gen";
import { maybeDelegateCommandToCustomHandler } from "../shared/customHandler_delegate";
import { exitIfUncommittedChanges } from "../shared/exitIfUncommittedChanges";
import { initializeAdminTheme } from "./initializeAdminTheme";

export async function command(params: { buildContext: BuildContext }) {
    const { buildContext } = params;

    const { hasBeenHandled } = maybeDelegateCommandToCustomHandler({
        commandName: "initialize-admin-theme",
        buildContext
    });

    if (hasBeenHandled) {
        return;
    }

    const adminThemeSrcDirPath = pathJoin(buildContext.themeSrcDirPath, "admin");

    if (
        fs.existsSync(adminThemeSrcDirPath) &&
        fs.readdirSync(adminThemeSrcDirPath).length > 0
    ) {
        console.warn(
            chalk.red(
                `There is already a ${pathRelative(
                    process.cwd(),
                    adminThemeSrcDirPath
                )} directory in your project. Aborting.`
            )
        );

        process.exit(-1);
    }

    exitIfUncommittedChanges({
        projectDirPath: buildContext.projectDirPath
    });

    await initializeAdminTheme({
        adminThemeSrcDirPath,
        buildContext
    });

    await updateKcGenCommand({
        buildContext: {
            ...buildContext,
            implementedThemeTypes: {
                ...buildContext.implementedThemeTypes,
                admin: {
                    isImplemented: true
                }
            }
        }
    });
}
