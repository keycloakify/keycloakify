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
import type { CliCommandOptions } from "./main";
import { getBuildContext } from "./shared/buildContext";
import chalk from "chalk";

export async function command(params: { cliCommandOptions: CliCommandOptions }) {
    const { cliCommandOptions } = params;

    const buildContext = getBuildContext({
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

    const templateValue = "Template.tsx (Layout common to every page)";
    const userProfileFormFieldsValue =
        "UserProfileFormFields.tsx (Renders the form of the register.ftl, login-update-profile.ftl, update-email.ftl and idp-review-user-profile.ftl)";

    const { value: pageIdOrComponent } = await cliSelect<
        | LoginThemePageId
        | AccountThemePageId
        | typeof templateValue
        | typeof userProfileFormFieldsValue
    >({
        values: (() => {
            switch (themeType) {
                case "login":
                    return [
                        templateValue,
                        userProfileFormFieldsValue,
                        ...loginThemePageIds
                    ];
                case "account":
                    return [templateValue, ...accountThemePageIds];
            }
            assert<Equals<typeof themeType, never>>(false);
        })()
    }).catch(() => {
        process.exit(-1);
    });

    console.log(`→ ${pageIdOrComponent}`);

    const componentBasename = (() => {
        if (pageIdOrComponent === templateValue) {
            return "Template.tsx";
        }

        if (pageIdOrComponent === userProfileFormFieldsValue) {
            return "UserProfileFormFields.tsx";
        }

        return capitalize(kebabCaseToCamelCase(pageIdOrComponent)).replace(/ftl$/, "tsx");
    })();

    const pagesOrDot = (() => {
        if (
            pageIdOrComponent === templateValue ||
            pageIdOrComponent === userProfileFormFieldsValue
        ) {
            return ".";
        }

        return "pages";
    })();

    const targetFilePath = pathJoin(
        buildContext.themeSrcDirPath,
        themeType,
        pagesOrDot,
        componentBasename
    );

    if (fs.existsSync(targetFilePath)) {
        console.log(
            `${pageIdOrComponent} is already ejected, ${pathRelative(
                process.cwd(),
                targetFilePath
            )} already exists`
        );

        process.exit(-1);
    }

    const componentCode = fs
        .readFileSync(
            pathJoin(
                getThisCodebaseRootDirPath(),
                "src",
                themeType,
                pagesOrDot,
                componentBasename
            )
        )
        .toString("utf8");

    {
        const targetDirPath = pathDirname(targetFilePath);

        if (!fs.existsSync(targetDirPath)) {
            fs.mkdirSync(targetDirPath, { recursive: true });
        }
    }

    fs.writeFileSync(targetFilePath, Buffer.from(componentCode, "utf8"));

    console.log(
        `${chalk.green("✓")} ${chalk.bold(
            pathJoin(".", pathRelative(process.cwd(), targetFilePath))
        )} copy pasted from the Keycloakify source code into your project`
    );

    edit_KcApp: {
        if (
            pageIdOrComponent !== templateValue &&
            pageIdOrComponent !== userProfileFormFieldsValue
        ) {
            break edit_KcApp;
        }

        const kcAppTsxPath = pathJoin(
            buildContext.themeSrcDirPath,
            themeType,
            "KcPage.tsx"
        );

        const kcAppTsxCode = fs.readFileSync(kcAppTsxPath).toString("utf8");

        const modifiedKcAppTsxCode = (() => {
            switch (pageIdOrComponent) {
                case templateValue:
                    return kcAppTsxCode.replace(
                        `keycloakify/${themeType}/Template`,
                        "./Template"
                    );
                case userProfileFormFieldsValue:
                    return kcAppTsxCode.replace(
                        `keycloakify/login/UserProfileFormFields`,
                        "./UserProfileFormFields"
                    );
            }
            assert<Equals<typeof pageIdOrComponent, never>>(false);
        })();

        if (kcAppTsxCode === modifiedKcAppTsxCode) {
            console.log(
                chalk.red(
                    "Unable to automatically update KcPage.tsx, please update it manually"
                )
            );
            return;
        }

        fs.writeFileSync(kcAppTsxPath, Buffer.from(modifiedKcAppTsxCode, "utf8"));

        console.log(
            `${chalk.green("✓")} ${chalk.bold(
                pathJoin(".", pathRelative(process.cwd(), kcAppTsxPath))
            )} Updated`
        );

        return;
    }

    const userProfileFormFieldComponentName = "UserProfileFormFields";

    console.log(
        [
            ``,
            `You now need to update your page router:`,
            ``,
            `${chalk.bold(
                pathJoin(
                    ".",
                    pathRelative(process.cwd(), buildContext.themeSrcDirPath),
                    themeType,
                    "KcPage.tsx"
                )
            )}:`,
            chalk.grey("```"),
            `// ...`,
            ``,
            chalk.green(
                `+const ${componentBasename.replace(
                    /.tsx$/,
                    ""
                )} = lazy(() => import("./pages/${componentBasename}"));`
            ),
            ...[
                ``,
                ` export default function KcPage(props: { kcContext: KcContext; }) {`,
                ``,
                `     // ...`,
                ``,
                `     return (`,
                `         <Suspense>`,
                `             {(() => {`,
                `                 switch (kcContext.pageId) {`,
                `                     // ...`,
                `+                    case "${pageIdOrComponent}": return (`,
                `+                        <${componentBasename}`,
                `+                            {...{ kcContext, i18n, classes }}`,
                `+                            Template={Template}`,
                `+                            doUseDefaultCss={true}`,
                ...(!componentCode.includes(userProfileFormFieldComponentName)
                    ? []
                    : [
                          `+                            ${userProfileFormFieldComponentName}={${userProfileFormFieldComponentName}}`,
                          `+                            doMakeUserConfirmPassword={doMakeUserConfirmPassword}`
                      ]),
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
