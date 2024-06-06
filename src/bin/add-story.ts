import { getThisCodebaseRootDirPath } from "./tools/getThisCodebaseRootDirPath";
import cliSelect from "cli-select";
import {
    loginThemePageIds,
    accountThemePageIds,
    type LoginThemePageId,
    type AccountThemePageId,
    themeTypes,
    type ThemeType
} from "./shared/constants";
import { capitalize } from "tsafe/capitalize";
import * as fs from "fs";
import { join as pathJoin, relative as pathRelative, dirname as pathDirname } from "path";
import { kebabCaseToCamelCase } from "./tools/kebabCaseToSnakeCase";
import { assert, Equals } from "tsafe/assert";
import { getThemeSrcDirPath } from "./shared/getThemeSrcDirPath";
import type { CliCommandOptions } from "./main";
import { readBuildOptions } from "./shared/buildOptions";
import chalk from "chalk";

export async function command(params: { cliCommandOptions: CliCommandOptions }) {
    const { cliCommandOptions } = params;

    const buildOptions = readBuildOptions({
        cliCommandOptions
    });

    console.log(chalk.cyan("Theme type:"));

    const { value: themeType } = await cliSelect<ThemeType>({
        values: [...themeTypes]
    }).catch(() => {
        process.exit(-1);
    });

    console.log(`→ ${themeType}`);

    console.log(chalk.cyan("Select the page you want to create a Storybook for:"));

    const { value: pageId } = await cliSelect<LoginThemePageId | AccountThemePageId>({
        values: (() => {
            switch (themeType) {
                case "login":
                    return [...loginThemePageIds];
                case "account":
                    return [...accountThemePageIds];
            }
            assert<Equals<typeof themeType, never>>(false);
        })()
    }).catch(() => {
        process.exit(-1);
    });

    console.log(`→ ${pageId}`);

    const { themeSrcDirPath } = getThemeSrcDirPath({
        reactAppRootDirPath: buildOptions.reactAppRootDirPath
    });

    const componentBasename = capitalize(kebabCaseToCamelCase(pageId)).replace(
        /ftl$/,
        "stories.tsx"
    );

    const targetFilePath = pathJoin(
        themeSrcDirPath,
        themeType,
        "pages",
        componentBasename
    );

    if (fs.existsSync(targetFilePath)) {
        console.log(`${pathRelative(process.cwd(), targetFilePath)} already exists`);

        process.exit(-1);
    }

    {
        const targetDirPath = pathDirname(targetFilePath);

        if (!fs.existsSync(targetDirPath)) {
            fs.mkdirSync(targetDirPath, { recursive: true });
        }
    }

    const componentCode = fs
        .readFileSync(
            pathJoin(
                getThisCodebaseRootDirPath(),
                "stories",
                themeType,
                "pages",
                componentBasename
            )
        )
        .toString("utf8");

    fs.writeFileSync(targetFilePath, Buffer.from(componentCode, "utf8"));

    console.log(
        `${chalk.green("✓")} ${chalk.bold(
            pathJoin(".", pathRelative(process.cwd(), targetFilePath))
        )} copy pasted from the Keycloakify source code into your project`
    );
}
