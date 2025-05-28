import type { BuildContext } from "./shared/buildContext";
import cliSelect from "cli-select";
import { maybeDelegateCommandToCustomHandler } from "./shared/customHandler_delegate";
import { exitIfUncommittedChanges } from "./shared/exitIfUncommittedChanges";
import { join as pathJoin, relative as pathRelative } from "path";
import * as fs from "fs";
import chalk from "chalk";
import { installExtension } from "./shared/installExtension";

export async function command(params: { buildContext: BuildContext }) {
    const { buildContext } = params;

    const { hasBeenHandled } = await maybeDelegateCommandToCustomHandler({
        commandName: "initialize-email-theme",
        buildContext
    });

    if (hasBeenHandled) {
        return;
    }

    exitIfUncommittedChanges({
        projectDirPath: buildContext.projectDirPath
    });

    const emailThemeSrcDirPath = pathJoin(buildContext.themeSrcDirPath, "email");

    if (
        fs.existsSync(emailThemeSrcDirPath) &&
        fs.readdirSync(emailThemeSrcDirPath).length > 0
    ) {
        console.warn(
            chalk.red(
                `There is already a ${pathRelative(
                    process.cwd(),
                    emailThemeSrcDirPath
                )} directory in your project. Aborting.`
            )
        );

        process.exit(-1);
    }

    const { value: emailThemeType } = await cliSelect({
        values: [
            "native (FreeMarker)" as const,
            "Another email templating solution" as const
        ]
    }).catch(() => {
        process.exit(-1);
    });

    if (emailThemeType === "Another email templating solution") {
        console.log(
            [
                "There is currently no automated support for keycloakify-email, it has to be done manually, see documentation:",
                "https://docs.keycloakify.dev/theme-types/email-theme"
            ].join("\n")
        );

        process.exit(0);
    }

    await installExtension({
        moduleName: "@keycloakify/email-native",
        buildContext
    });

    console.log(chalk.green("Email theme initialized."));
}
