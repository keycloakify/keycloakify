#!/usr/bin/env node

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

    console.log(chalk.cyan("Select the page you want to customize:"));

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

    const componentPageBasename = capitalize(kebabCaseToCamelCase(pageId)).replace(
        /ftl$/,
        "tsx"
    );

    const { themeSrcDirPath } = getThemeSrcDirPath({
        reactAppRootDirPath: buildOptions.reactAppRootDirPath
    });

    const targetFilePath = pathJoin(
        themeSrcDirPath,
        themeType,
        "pages",
        componentPageBasename
    );

    if (fs.existsSync(targetFilePath)) {
        console.log(
            `${pageId} is already ejected, ${pathRelative(
                process.cwd(),
                targetFilePath
            )} already exists`
        );

        process.exit(-1);
    }

    {
        const targetDirPath = pathDirname(targetFilePath);

        if (!fs.existsSync(targetDirPath)) {
            fs.mkdirSync(targetDirPath, { recursive: true });
        }
    }

    const componentPageContent = fs
        .readFileSync(
            pathJoin(
                getThisCodebaseRootDirPath(),
                "src",
                themeType,
                "pages",
                componentPageBasename
            )
        )
        .toString("utf8");

    fs.writeFileSync(targetFilePath, Buffer.from(componentPageContent, "utf8"));

    const userProfileFormFieldComponentName = "UserProfileFormFields";

    console.log(
        [
            ``,
            `${chalk.green("✓")} ${chalk.bold(
                pathJoin(".", pathRelative(process.cwd(), targetFilePath))
            )} copy pasted from the Keycloakify source code into your project`,
            ``,
            `You now need to update your page router:`,
            ``,
            `${chalk.bold(
                pathJoin(
                    ".",
                    pathRelative(process.cwd(), themeSrcDirPath),
                    themeType,
                    "KcApp.tsx"
                )
            )}:`,
            chalk.grey("```"),
            `// ...`,
            ``,
            chalk.green(
                `+const ${componentPageBasename.replace(
                    /.tsx$/,
                    ""
                )} = lazy(() => import("./pages/${componentPageBasename}"));`
            ),
            ...[
                ``,
                ` export default function KcApp(props: { kcContext: KcContext; }) {`,
                ``,
                `     // ...`,
                ``,
                `     return (`,
                `         <Suspense>`,
                `             {(() => {`,
                `                 switch (kcContext.pageId) {`,
                `                     // ...`,
                `+                    case "${pageId}": return (`,
                `+                        <Login`,
                `+                            {...{ kcContext, i18n, classes }}`,
                `+                            Template={Template}`,
                ...(!componentPageContent.includes(userProfileFormFieldComponentName)
                    ? []
                    : [
                          `+                            ${userProfileFormFieldComponentName}={${userProfileFormFieldComponentName}}`
                      ]),
                `+                            doUseDefaultCss={true}`,
                `+                        />`,
                `+                    );`,
                `                     default: return <Fallback /* .. */ />;`,
                `                 }`,
                `             })()}`,
                `         </Suspense>`,
                `     );`,
                ` }`
            ].map(line => {
                if (line.startsWith("+")) {
                    return chalk.green(line);
                }
                if (line.startsWith("-")) {
                    return chalk.red(line);
                }
                return chalk.grey(line);
            }),
            chalk.grey("```")
        ].join("\n")
    );
}
