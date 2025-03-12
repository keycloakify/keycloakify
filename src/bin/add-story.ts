import { getThisCodebaseRootDirPath } from "./tools/getThisCodebaseRootDirPath";
import cliSelect from "cli-select";
import {
    LOGIN_THEME_PAGE_IDS,
    ACCOUNT_THEME_PAGE_IDS,
    type LoginThemePageId,
    type AccountThemePageId,
    THEME_TYPES
} from "./shared/constants";
import { capitalize } from "tsafe/capitalize";
import * as fs from "fs";
import { join as pathJoin, relative as pathRelative, dirname as pathDirname } from "path";
import { kebabCaseToCamelCase } from "./tools/kebabCaseToSnakeCase";
import { assert, Equals } from "tsafe/assert";
import type { BuildContext } from "./shared/buildContext";
import chalk from "chalk";
import { runPrettier, getIsPrettierAvailable } from "./tools/runPrettier";
import { maybeDelegateCommandToCustomHandler } from "./shared/customHandler_delegate";

export async function command(params: { buildContext: BuildContext }) {
    const { buildContext } = params;

    const { hasBeenHandled } = await maybeDelegateCommandToCustomHandler({
        commandName: "add-story",
        buildContext
    });

    if (hasBeenHandled) {
        return;
    }

    console.log(chalk.cyan("Theme type:"));

    const themeType = await (async () => {
        const values = THEME_TYPES.filter(themeType => {
            switch (themeType) {
                case "account":
                    return buildContext.implementedThemeTypes.account.isImplemented;
                case "login":
                    return buildContext.implementedThemeTypes.login.isImplemented;
                case "admin":
                    return buildContext.implementedThemeTypes.admin.isImplemented;
            }
            assert<Equals<typeof themeType, never>>(false);
        });

        assert(values.length > 0, "No theme is implemented in this project");

        if (values.length === 1) {
            return values[0];
        }

        const { value } = await cliSelect({
            values
        }).catch(() => {
            process.exit(-1);
        });

        return value;
    })();

    if (
        themeType === "account" &&
        (assert(buildContext.implementedThemeTypes.account.isImplemented),
        buildContext.implementedThemeTypes.account.type === "Single-Page")
    ) {
        console.log(
            `${chalk.red("✗")} Sorry, there is no Storybook support for Single-Page Account themes.`
        );

        process.exit(0);
        return;
    }

    if (themeType === "admin") {
        console.log(
            `${chalk.red("✗")} Sorry, there is no Storybook support for the Admin UI.`
        );

        process.exit(0);
        return;
    }

    console.log(`→ ${themeType}`);

    console.log(chalk.cyan("Select the page you want to create a Storybook for:"));

    const { value: pageId } = await cliSelect<LoginThemePageId | AccountThemePageId>({
        values: (() => {
            switch (themeType) {
                case "login":
                    return [...LOGIN_THEME_PAGE_IDS];
                case "account":
                    return [...ACCOUNT_THEME_PAGE_IDS];
            }
            assert<Equals<typeof themeType, never>>(false);
        })()
    }).catch(() => {
        process.exit(-1);
    });

    console.log(`→ ${pageId}`);

    const componentBasename = capitalize(kebabCaseToCamelCase(pageId)).replace(
        /ftl$/,
        "stories.tsx"
    );

    const targetFilePath = pathJoin(
        buildContext.themeSrcDirPath,
        themeType,
        "pages",
        componentBasename
    );

    if (fs.existsSync(targetFilePath)) {
        console.log(`${pathRelative(process.cwd(), targetFilePath)} already exists`);

        process.exit(-1);
    }

    let sourceCode = fs
        .readFileSync(
            pathJoin(
                getThisCodebaseRootDirPath(),
                "stories",
                themeType,
                "pages",
                componentBasename
            )
        )
        .toString("utf8")
        .replace('import React from "react";\n', "")
        .replace(/from "[./]+dist\//, 'from "keycloakify/');

    run_prettier: {
        if (!(await getIsPrettierAvailable())) {
            break run_prettier;
        }

        sourceCode = await runPrettier({
            filePath: targetFilePath,
            sourceCode: sourceCode
        });
    }

    {
        const targetDirPath = pathDirname(targetFilePath);

        if (!fs.existsSync(targetDirPath)) {
            fs.mkdirSync(targetDirPath, { recursive: true });
        }
    }

    fs.writeFileSync(targetFilePath, Buffer.from(sourceCode, "utf8"));

    console.log(
        [
            `${chalk.green("✓")} ${chalk.bold(
                pathJoin(".", pathRelative(process.cwd(), targetFilePath))
            )} copy pasted from the Keycloakify source code into your project`,
            `You can start storybook with ${chalk.bold("npm run storybook")}`
        ].join("\n")
    );
}
