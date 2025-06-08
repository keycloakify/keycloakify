import { maybeDelegateCommandToCustomHandler } from "./shared/customHandler_delegate";
import { dirname as pathDirname, join as pathJoin } from "path";
import type { BuildContext } from "./shared/buildContext";
import * as fs from "fs/promises";
import { assert, is, type Equals } from "tsafe/assert";
import { id } from "tsafe/id";
import { addSyncExtensionsToPostinstallScript } from "./shared/addSyncExtensionsToPostinstallScript";
import { getIsPrettierAvailable, runPrettier } from "./tools/runPrettier";
import { npmInstall } from "./tools/npmInstall";
import * as child_process from "child_process";
import { z } from "zod";
import chalk from "chalk";
import cliSelect from "cli-select";
import { existsAsync } from "./tools/fs.existsAsync";

export async function command(params: { buildContext: BuildContext }) {
    const { buildContext } = params;

    const { hasBeenHandled } = await maybeDelegateCommandToCustomHandler({
        commandName: "initialize-login-theme",
        buildContext
    });

    if (hasBeenHandled) {
        return;
    }

    if (
        buildContext.implementedThemeTypes.login.isImplemented ||
        buildContext.implementedThemeTypes.login.isImplemented_native
    ) {
        console.warn(chalk.red("There is already a login theme in your project"));

        process.exit(-1);
    }

    const parsedPackageJson = await (async () => {
        type ParsedPackageJson = {
            scripts?: Record<string, string | undefined>;
            dependencies?: Record<string, string | undefined>;
            devDependencies?: Record<string, string | undefined>;
        };

        const zParsedPackageJson = (() => {
            type TargetType = ParsedPackageJson;

            const zTargetType = z.object({
                scripts: z.record(z.union([z.string(), z.undefined()])).optional(),
                dependencies: z.record(z.union([z.string(), z.undefined()])).optional(),
                devDependencies: z.record(z.union([z.string(), z.undefined()])).optional()
            });

            assert<Equals<z.infer<typeof zTargetType>, TargetType>>;

            return id<z.ZodType<TargetType>>(zTargetType);
        })();
        const parsedPackageJson = JSON.parse(
            (await fs.readFile(buildContext.packageJsonFilePath)).toString("utf8")
        );

        zParsedPackageJson.parse(parsedPackageJson);

        assert(is<ParsedPackageJson>(parsedPackageJson));

        return parsedPackageJson;
    })();

    addSyncExtensionsToPostinstallScript({
        parsedPackageJson,
        buildContext
    });

    const doInstallStories = await (async () => {
        console.log(chalk.cyan(`\nDo you want to install the Stories?`));

        const YES = "Yes (Recommended)";
        const NO = "No";

        const { value } = await cliSelect({
            values: [YES, NO]
        }).catch(() => {
            process.exit(-1);
        });

        console.log(value);

        return value === YES;
    })();

    install_storybook: {
        if (!doInstallStories) {
            break install_storybook;
        }

        if (buildContext.bundler !== "vite") {
            break install_storybook;
        }

        if (
            Object.keys({
                ...parsedPackageJson.dependencies,
                ...parsedPackageJson.devDependencies
            }).includes("storybook")
        ) {
            break install_storybook;
        }

        (parsedPackageJson.scripts ??= {})["storybook"] = "storybook dev -p 6006";
        parsedPackageJson.scripts["build-storybook"] = "storybook build";

        (parsedPackageJson.devDependencies ??= {})["storybook"] = "^9.0.4";
        parsedPackageJson.devDependencies["@storybook/react-vite"] = "^9.0.4";

        const files: { relativeFilePath: string; fileContent: string }[] = [
            {
                relativeFilePath: "main.ts",
                fileContent: [
                    `import type { StorybookConfig } from "@storybook/react-vite";`,
                    ``,
                    `const config: StorybookConfig = {`,
                    `    stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],`,
                    `    addons: [],`,
                    `    framework: {`,
                    `        name: "@storybook/react-vite",`,
                    `        options: {}`,
                    `    },`,
                    `};`,
                    `export default config;`,
                    ``
                ].join("\n")
            },
            {
                relativeFilePath: "preview.ts",
                fileContent: storybookPreviewTsFileContent
            }
        ];

        for (let { relativeFilePath, fileContent } of files) {
            const filePath = pathJoin(
                buildContext.projectDirPath,
                ".storybook",
                relativeFilePath
            );

            {
                const dirPath = pathDirname(filePath);

                if (!(await existsAsync(dirPath))) {
                    await fs.mkdir(dirPath, { recursive: true });
                }
            }

            run_prettier: {
                if (!(await getIsPrettierAvailable())) {
                    break run_prettier;
                }

                fileContent = await runPrettier({
                    filePath: filePath,
                    sourceCode: fileContent
                });
            }

            await fs.writeFile(filePath, Buffer.from(fileContent, "utf8"));
        }
    }

    {
        const moduleName = "@keycloakify/login-ui";

        const latestVersion = await getModuleLatestVersion({ moduleName });

        (parsedPackageJson.dependencies ??= {})[moduleName] = `~${latestVersion}`;

        if (parsedPackageJson.devDependencies !== undefined) {
            delete parsedPackageJson.devDependencies[moduleName];
        }
    }

    install_stories: {
        if (!doInstallStories) {
            break install_stories;
        }

        const moduleName = "@keycloakify/login-ui-storybook";

        const latestVersion = await getModuleLatestVersion({ moduleName });

        (parsedPackageJson.devDependencies ??= {})[moduleName] = `~${latestVersion}`;

        delete parsedPackageJson.dependencies[moduleName];
    }

    {
        let sourceCode = JSON.stringify(parsedPackageJson, null, 2);

        if (await getIsPrettierAvailable()) {
            sourceCode = await runPrettier({
                sourceCode,
                filePath: buildContext.packageJsonFilePath
            });
        }

        await fs.writeFile(
            buildContext.packageJsonFilePath,
            Buffer.from(sourceCode, "utf8")
        );
    }

    await npmInstall({
        packageJsonDirPath: pathDirname(buildContext.packageJsonFilePath)
    });
}

async function getModuleLatestVersion(params: { moduleName: string }) {
    const { moduleName } = params;

    const versions = ((): string[] => {
        const cmdOutput = child_process
            .execSync(`npm show ${moduleName} versions --json`)
            .toString("utf8")
            .trim();

        const versions = JSON.parse(cmdOutput) as string | string[];

        // NOTE: Bug in some older npm versions
        if (typeof versions === "string") {
            return [versions];
        }

        return versions;
    })();

    const version = versions.reverse().filter(version => !version.includes("-"))[0];

    assert(version !== undefined);

    return version;
}

const storybookPreviewTsFileContent = [
    `import type { Preview } from "@storybook/react-vite";`,
    ``,
    `const preview: Preview = {`,
    `    parameters: {`,
    `        controls: {`,
    `            matchers: {`,
    `                color: /(background|color)$/i,`,
    `                date: /Date$/i`,
    `            }`,
    `        },`,
    `        options: {`,
    `            storySort: (a, b)=> {`,
    ``,
    `                const orderedPagesPrefix = [`,
    `                    "Introduction",`,
    `                    "login/login.ftl",`,
    `                    "login/register.ftl",`,
    `                    "login/terms.ftl",`,
    `                    "login/error.ftl",`,
    `                    "login/code.ftl",`,
    `                    "login/delete-account-confirm.ftl",`,
    `                    "login/delete-credential.ftl",`,
    `                    "login/frontchannel-logout.ftl",`,
    `                    "login/idp-review-user-profile.ftl",`,
    `                    "login/info.ftl",`,
    `                    "login/login-config-totp.ftl",`,
    `                    "login/login-idp-link-confirm.ftl",`,
    `                    "login/login-idp-link-email.ftl",`,
    `                    "login/login-oauth-grant.ftl",`,
    `                    "login/login-otp.ftl",`,
    `                    "login/login-page-expired.ftl",`,
    `                    "login/login-password.ftl",`,
    `                    "login/login-reset-otp.ftl",`,
    `                    "login/login-reset-password.ftl",`,
    `                    "login/login-update-password.ftl",`,
    `                    "login/login-update-profile.ftl",`,
    `                    "login/login-username.ftl",`,
    `                    "login/login-verify-email.ftl",`,
    `                    "login/login-x509-info.ftl",`,
    `                    "login/logout-confirm.ftl",`,
    `                    "login/saml-post-form.ftl",`,
    `                    "login/select-authenticator.ftl",`,
    `                    "login/update-email.ftl",`,
    `                    "login/webauthn-authenticate.ftl",`,
    `                    "login/webauthn-error.ftl",`,
    `                    "login/webauthn-register.ftl",`,
    `                    "login/login-oauth2-device-verify-user-code.ftl",`,
    `                    "login/login-recovery-authn-code-config.ftl",`,
    `                    "login/login-recovery-authn-code-input.ftl",`,
    `                    "account/account.ftl",`,
    `                    "account/password.ftl",`,
    `                    "account/federatedIdentity.ftl",`,
    `                    "account/log.ftl",`,
    `                    "account/sessions.ftl",`,
    `                    "account/totp.ftl"`,
    `                ];`,
    ``,
    `                function getHardCodedWeight(title) {`,
    `                    for (let i = 0; i < orderedPagesPrefix.length; i++) {`,
    `                        if (`,
    `                            title`,
    `                                .toLowerCase()`,
    `                                .startsWith(orderedPagesPrefix[i].toLowerCase())`,
    `                        ) {`,
    `                            return orderedPagesPrefix.length - i;`,
    `                        }`,
    `                    }`,
    ``,
    `                    return 0;`,
    `                }`,
    ``,
    `                return getHardCodedWeight(b.title) - getHardCodedWeight(a.title);`,
    ``,
    `            }`,
    ``,
    `        }`,
    `    }`,
    `};`,
    ``,
    `export default preview;`,
    ``
].join("\n");
