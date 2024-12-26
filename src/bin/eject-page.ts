#!/usr/bin/env node

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
import { maybeDelegateCommandToCustomHandler } from "./shared/customHandler_delegate";
import { runPrettier, getIsPrettierAvailable } from "./tools/runPrettier";

export async function command(params: { buildContext: BuildContext }) {
    const { buildContext } = params;

    const { hasBeenHandled } = maybeDelegateCommandToCustomHandler({
        commandName: "eject-page",
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

    if (themeType === "admin") {
        console.log("Use `npx keycloakify own` command instead, see documentation");

        process.exit(-1);
    }

    if (
        themeType === "account" &&
        (assert(buildContext.implementedThemeTypes.account.isImplemented),
        buildContext.implementedThemeTypes.account.type === "Single-Page")
    ) {
        console.log(
            chalk.yellow(
                [
                    "You are implementing a Single-Page Account theme.",
                    "The eject-page command isn't applicable in this context"
                ].join("\n")
            )
        );

        process.exit(1);
        return;
    }

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
                        ...LOGIN_THEME_PAGE_IDS
                    ];
                case "account":
                    return [templateValue, ...ACCOUNT_THEME_PAGE_IDS];
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

    let componentCode = fs
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

    run_prettier: {
        if (!(await getIsPrettierAvailable())) {
            break run_prettier;
        }

        componentCode = await runPrettier({
            filePath: targetFilePath,
            sourceCode: componentCode
        });
    }

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

    edit_KcPage: {
        if (
            pageIdOrComponent !== templateValue &&
            pageIdOrComponent !== userProfileFormFieldsValue
        ) {
            break edit_KcPage;
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

    const componentName = componentBasename.replace(/.tsx$/, "");

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
                `+const ${componentName} = lazy(() => import("./pages/${componentName}"));`
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
                `+                        <${componentName}`,
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
