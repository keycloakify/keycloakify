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
import type { CliCommandOptions as CliCommandOptions_common } from "./main";
import { getBuildContext } from "./shared/buildContext";
import chalk from "chalk";
import { addImportAndSwitchToKCPage } from "./tools/addImportAndSwitchToKCPage";

export type CliEjectPageCommandOptions = CliCommandOptions_common & {
    pages: string | undefined;
};

export async function command(params: { cliCommandOptions: CliEjectPageCommandOptions }) {
    const { cliCommandOptions } = params;

    // The user passes a comma-separated string, but we split it based on spaces
    // because it seems the Termost library does some unexpected manipulation of the string behind the scenes!
    // It doesn't return a string[] but instead an ordinary string separated by spaces (even if we change the type of pages to string[]).
    // This might be a bug in Termost.
    let cliPagesToEject: string[] | undefined = cliCommandOptions.pages?.split(" ");

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

    const templateValue = "Template.tsx";
    const userProfileFormFieldsValue = "UserProfileFormFields.tsx";

    type AllowedPagesType =
        | LoginThemePageId
        | AccountThemePageId
        | typeof templateValue
        | typeof userProfileFormFieldsValue;

    let allowedPages: AllowedPagesType[] = (() => {
        switch (themeType) {
            case "login":
                return [
                    templateValue,
                    userProfileFormFieldsValue,
                    ...LOGIN_THEME_PAGE_IDS
                ];
            case "account":
                return [templateValue, ...ACCOUNT_THEME_PAGE_IDS];
            default:
                assert<Equals<typeof themeType, never>>(false);
        }
    })();

    if (!cliPagesToEject) {
        console.log(
            [
                chalk.cyan("Select the page you want to customize:"),
                chalk.gray("Layout is common to every page"),
                chalk.gray(
                    "UserProfileFormFields Renders the form of the register.ftl, login-update-profile.ftl, update-email.ftl and idp-review-user-profile.ftl"
                ),
                chalk.gray(
                    "You can also explicitly provide the pages e.g. `npx keycloakify eject-page --pages Template.tsx,Login.ftl,...`"
                ),
                chalk.gray(
                    "You can also use `npx keycloakify eject-page --pages all` to add all pages"
                )
            ].join("\n")
        );
        const { value: pageIdOrComponent } = await cliSelect<AllowedPagesType>({
            values: (() => allowedPages)()
        }).catch(() => {
            process.exit(-1);
        });
        cliPagesToEject = [pageIdOrComponent];
    }

    // Support for eject-page --pages all
    if (cliPagesToEject.length == 1 && cliPagesToEject[0] == "all") {
        cliPagesToEject = allowedPages;
    }
    // if user input pages does not exist then show him some helpful tips about the allowed pages and exit
    for (const pageIdOrComponent of cliPagesToEject) {
        if (
            !allowedPages.some(
                allowedPage => allowedPage.toString() === pageIdOrComponent
            )
        ) {
            console.error(
                `${pageIdOrComponent} not found in the list of allowed pages, exiting the eject-command`
            );
            console.error(`Allowed pages are : ${allowedPages}`);
            process.exit(-1);
        }
    }
    for (let pageIdOrComponent of cliPagesToEject) {
        const componentBasename = (() => {
            if (pageIdOrComponent === templateValue) {
                return "Template.tsx";
            }

            if (pageIdOrComponent === userProfileFormFieldsValue) {
                return "UserProfileFormFields.tsx";
            }

            return capitalize(kebabCaseToCamelCase(pageIdOrComponent)).replace(
                /ftl$/,
                "tsx"
            );
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

        // Copy PasswordWrapper if it's imported
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
                continue;
            }

            fs.writeFileSync(kcAppTsxPath, Buffer.from(modifiedKcAppTsxCode, "utf8"));

            console.log(
                `${chalk.green("✓")} ${chalk.bold(
                    pathJoin(".", pathRelative(process.cwd(), kcAppTsxPath))
                )} Updated`
            );

            continue;
        }

        const userProfileFormFieldComponentName = "UserProfileFormFields";

        const componentName = componentBasename.replace(/.tsx$/, "");

        let kcPagePath = pathJoin(
            ".",
            pathRelative(process.cwd(), buildContext.themeSrcDirPath),
            themeType,
            "KcPage.tsx"
        );
        console.log(`updating  ${kcPagePath}`);
        /*
            Load page from kcPagePath, find switch (kcContext.pageId)
             Add a new case to it that return a react component(componentName)
             default attributes for new component is
               {...{ kcContext, i18n, classes }}`,
               Template={Template}`,
                doUseDefaultCss={true}`,
             and in case componentCode.includes(userProfileFormFieldComponentName) is true two more attribute will be added
               ${userProfileFormFieldComponentName}={${userProfileFormFieldComponentName}}`,
               doMakeUserConfirmPassword={doMakeUserConfirmPassword}`
           this will also add lazy import to file :
           const componentName = lazy(() => import("./pages/componentName"));
         */
        await addImportAndSwitchToKCPage(
            kcPagePath,
            pageIdOrComponent,
            componentName,
            componentCode.includes(userProfileFormFieldComponentName)
        );
        console.log(`Update finished, new router added successfully to ${kcPagePath}`);
    }
}
