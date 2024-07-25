import { relative as pathRelative } from "path";
import chalk from "chalk";
import { copyBoilerplate } from "./copyBoilerplate";

export async function initializeAccountTheme_multiPage(params: {
    accountThemeSrcDirPath: string;
}) {
    const { accountThemeSrcDirPath } = params;

    copyBoilerplate({
        accountThemeType: "Multi-Page",
        accountThemeSrcDirPath
    });

    console.log(
        [
            chalk.green("The Multi-Page account theme has been initialized."),
            `Directory created: ${chalk.bold(pathRelative(process.cwd(), accountThemeSrcDirPath))}`
        ].join("\n")
    );
}
