import { join as pathJoin, relative as pathRelative, sep as pathSep } from "path";
import { promptKeycloakVersion } from "./shared/promptKeycloakVersion";
import { getBuildContext } from "./shared/buildContext";
import { downloadKeycloakDefaultTheme } from "./shared/downloadKeycloakDefaultTheme";
import { transformCodebase } from "./tools/transformCodebase";
import type { CliCommandOptions } from "./main";
import chalk from "chalk";

export async function command(params: { cliCommandOptions: CliCommandOptions }) {
    const { cliCommandOptions } = params;

    const buildContext = getBuildContext({
        cliCommandOptions
    });

    console.log(
        chalk.cyan(
            "Select the Keycloak version from which you want to download the builtins theme:"
        )
    );

    const { keycloakVersion } = await promptKeycloakVersion({
        startingFromMajor: undefined,
        cacheDirPath: buildContext.cacheDirPath
    });

    console.log(`→ ${keycloakVersion}`);

    const destDirPath = pathJoin(
        buildContext.keycloakifyBuildDirPath,
        "src",
        "main",
        "resources",
        "theme"
    );

    console.log(
        [
            `Downloading builtins theme of Keycloak ${keycloakVersion} here:`,
            `- ${chalk.bold(
                `.${pathSep}${pathJoin(pathRelative(process.cwd(), destDirPath), "base")}`
            )}`,
            `- ${chalk.bold(
                `.${pathSep}${pathJoin(
                    pathRelative(process.cwd(), destDirPath),
                    "keycloak"
                )}`
            )}`
        ].join("\n")
    );

    const { defaultThemeDirPath } = await downloadKeycloakDefaultTheme({
        keycloakVersion,
        buildContext
    });

    transformCodebase({
        srcDirPath: defaultThemeDirPath,
        destDirPath
    });

    console.log(chalk.green(`✓ done`));
}
