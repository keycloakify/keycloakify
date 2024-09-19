#!/usr/bin/env node

import { getThisCodebaseRootDirPath } from "./tools/getThisCodebaseRootDirPath";
import cliSelect from "cli-select";
import {
    LOGIN_THEME_PAGE_IDS,
    ACCOUNT_THEME_PAGE_IDS,
    type LoginThemePageId,
    type AccountThemePageId,
    THEME_TYPES,
    type ThemeType
} from "./shared/constants";
import { capitalize } from "tsafe/capitalize";
import * as fs from "fs";
import {
    join as pathJoin,
    relative as pathRelative,
    dirname as pathDirname,
    basename as pathBasename
} from "path";
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

    const themeType = await (async () => {
        const values = THEME_TYPES.filter(themeType => {
            switch (themeType) {
                case "account":
                    return buildContext.implementedThemeTypes.account.isImplemented;
                case "login":
                    return buildContext.implementedThemeTypes.login.isImplemented;
            }
            assert<Equals<typeof themeType, never>>(false);
        });

        assert(values.length > 0, "No theme is implemented in this project");

        if (values.length === 1) {
            return values[0];
        }

        const { value } = await cliSelect<ThemeType>({
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
        const srcDirPath = pathJoin(
            pathDirname(buildContext.packageJsonFilePath),
            "node_modules",
            "@keycloakify",
            "keycloak-account-ui",
            "src"
        );

        console.log(
            [
                `There isn't an interactive CLI to eject components of the Single-Page Account theme.`,
                `You can however copy paste into your codebase the any file or directory from the following source directory:`,
                ``,
                `${chalk.bold(pathJoin(pathRelative(process.cwd(), srcDirPath)))}`,
                ``
            ].join("\n")
        );

        eject_entrypoint: {
            const kcAccountUiTsxFileRelativePath = "KcAccountUi.tsx";

            const accountThemeSrcDirPath = pathJoin(
                buildContext.themeSrcDirPath,
                "account"
            );

            const targetFilePath = pathJoin(
                accountThemeSrcDirPath,
                kcAccountUiTsxFileRelativePath
            );

            if (fs.existsSync(targetFilePath)) {
                break eject_entrypoint;
            }

            fs.cpSync(
                pathJoin(srcDirPath, kcAccountUiTsxFileRelativePath),
                targetFilePath
            );

            {
                const kcPageTsxFilePath = pathJoin(accountThemeSrcDirPath, "KcPage.tsx");

                const kcPageTsxCode = fs.readFileSync(kcPageTsxFilePath).toString("utf8");

                const componentName = pathBasename(
                    kcAccountUiTsxFileRelativePath
                ).replace(/.tsx$/, "");

                const modifiedKcPageTsxCode = kcPageTsxCode.replace(
                    `@keycloakify/keycloak-account-ui/${componentName}`,
                    `./${componentName}`
                );

                fs.writeFileSync(
                    kcPageTsxFilePath,
                    Buffer.from(modifiedKcPageTsxCode, "utf8")
                );
            }

            const routesTsxFilePath = pathRelative(
                process.cwd(),
                pathJoin(srcDirPath, "routes.tsx")
            );

            console.log(
                [
                    `To help you get started ${chalk.bold(pathRelative(process.cwd(), targetFilePath))} has been copied into your project.`,
                    `The next step is usually to eject ${chalk.bold(routesTsxFilePath)}`,
                    `with \`cp ${routesTsxFilePath} ${pathRelative(process.cwd(), accountThemeSrcDirPath)}\``,
                    `then update the import of routes in ${kcAccountUiTsxFileRelativePath}.`
                ].join("\n")
            );
        }

        process.exit(0);
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

    {
        const targetDirPath = pathDirname(targetFilePath);

        if (!fs.existsSync(targetDirPath)) {
            fs.mkdirSync(targetDirPath, { recursive: true });
        }
    }

    //Remove spaces in case of file formatting change in future
    const passwordWrapperRegex =
        /import\s*{\s*PasswordWrapper\s*}\s*from\s*"keycloakify\/login\/pages\/PasswordWrapper";/;

    // Copy PasswordWrapper in case the component need it
    if (passwordWrapperRegex.test(componentCode)) {
        //Change import path so that it works in user's project code base
        componentCode = componentCode.replace(
            passwordWrapperRegex,
            `import { PasswordWrapper } from "./PasswordWrapper";`
        );

        const passwordWrapperFilePathInKeycloakify = pathJoin(
            getThisCodebaseRootDirPath(),
            "src",
            themeType,
            pagesOrDot,
            "PasswordWrapper.tsx"
        );
        const passwordWrapperFilePathInUserProject = pathJoin(
            buildContext.themeSrcDirPath,
            themeType,
            pagesOrDot,
            "PasswordWrapper.tsx"
        );
        fs.copyFileSync(
            passwordWrapperFilePathInKeycloakify,
            passwordWrapperFilePathInUserProject
        );
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
