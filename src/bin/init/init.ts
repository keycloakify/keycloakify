import { setupVitePluginIfNeeded } from "./setupVitePluginIfNeeded";
import { getBuildContext } from "../shared/buildContext";
import { maybeDelegateCommandToCustomHandler } from "../shared/customHandler_delegate";
import { z } from "zod";
import { assert, type Equals, is } from "tsafe/assert";
import { id } from "tsafe/id";
import * as fs from "fs/promises";
import { runPrettier, getIsPrettierAvailable } from "../tools/runPrettier";
import cliSelect from "cli-select";
import { THEME_TYPES } from "../shared/constants";
import chalk from "chalk";
import { join as pathJoin, relative as pathRelative } from "path";
import { existsAsync } from "../tools/fs.existsAsync";
import { KEYCLOAK_THEME } from "../shared/constants";

export async function command(params: { projectDirPath: string }) {
    const { projectDirPath } = params;

    await setupVitePluginIfNeeded({ projectDirPath });

    const buildContext = getBuildContext({ projectDirPath });

    const { hasBeenHandled } = await maybeDelegateCommandToCustomHandler({
        commandName: "init",
        buildContext
    });

    if (hasBeenHandled) {
        return;
    }

    let doAddRunDevScript = false;

    setup_src: {
        if (buildContext.bundler !== "vite") {
            break setup_src;
        }

        const srcDirPath = pathJoin(buildContext.themeSrcDirPath, "src");

        const mainTsxFilePath = pathJoin(srcDirPath, "main.tsx");

        if (!(await existsAsync(mainTsxFilePath))) {
            break setup_src;
        }

        const isAlreadySetup = await (async () => {
            if (buildContext.themeSrcDirPath !== srcDirPath) {
                return true;
            }

            {
                const basenames = await fs.readdir(srcDirPath);

                for (const basename of basenames) {
                    const path = pathJoin(srcDirPath, basename);

                    if (!(await fs.stat(path)).isFile()) {
                        continue;
                    }

                    if ((await fs.readFile(path)).toString("utf8").includes("./kc.gen")) {
                        return true;
                    }
                }
            }

            for (const themeType of [...THEME_TYPES, "email"]) {
                if (!(await existsAsync(pathJoin(srcDirPath, themeType)))) {
                    continue;
                }
                return true;
            }

            return false;
        })();

        if (isAlreadySetup) {
            break setup_src;
        }

        const doSetupAsStandalone = await (async () => {
            const relativeProjectDirPath = pathRelative(
                process.cwd(),
                buildContext.projectDirPath
            );

            console.log(
                chalk.cyan(
                    [
                        relativeProjectDirPath === ""
                            ? "This Vite project"
                            : `The Vite project at ${relativeProjectDirPath}`,
                        "is it dedicated *only* to building a Keycloak theme?"
                    ].join(" ")
                )
            );

            const YES = "Yes — this project is only for the Keycloak theme (recommended)";
            const NO =
                "No — I'm building an app and a Keycloak theme in the same project (advanced)";

            const { value } = await cliSelect({ values: [YES, NO] }).catch(() => {
                process.exit(-1);
            });

            return value === YES;
        })();

        let files: { relativeFilePath: string; fileContent: string }[];

        if (doSetupAsStandalone) {
            const viteEnvDTsFilePath = pathJoin(
                buildContext.themeSrcDirPath,
                "vite-env.d.ts"
            );

            const viteEnvDTsContent = await fs.readFile(viteEnvDTsFilePath);

            await fs.rm(srcDirPath, { recursive: true });

            await fs.mkdir(srcDirPath);

            await fs.writeFile(viteEnvDTsFilePath, viteEnvDTsContent);

            files = [
                {
                    relativeFilePath: "main.tsx",
                    fileContent: [
                        `if (import.meta.env.PROD) {`,
                        `    import("./main-kc");`,
                        `} else {`,
                        `    import("./main-kc.dev");`,
                        `}`
                    ].join("\n")
                },
                {
                    relativeFilePath: "main-kc.dev.tsx",
                    fileContent: `export {};\n`
                },
                {
                    relativeFilePath: "main-kc.tsx",
                    fileContent: [
                        `import { createRoot } from "react-dom/client";`,
                        `import { StrictMode } from "react";`,
                        `import { KcPage } from "./kc.gen";`,
                        ``,
                        `if (!window.kcContext) {`,
                        `    throw new Error("No Keycloak context");`,
                        `}`,
                        ``,
                        `createRoot(document.getElementById("root")!).render(`,
                        `    <StrictMode>`,
                        `        <KcPage kcContext={window.kcContext} />`,
                        `    </StrictMode>`,
                        `);`
                    ].join("\n")
                }
            ];
        } else {
            doAddRunDevScript = true;

            await fs.copyFile(
                mainTsxFilePath,
                pathJoin(buildContext.themeSrcDirPath, "main-app.tsx")
            );

            files = [
                {
                    relativeFilePath: "main.tsx",
                    fileContent: [
                        `if (window.kcContext !== undefined) {`,
                        `    import("./keycloak-theme/main");`,
                        `} else if (import.meta.env.VITE_KC_DEV === "true") {`,
                        `    import("./keycloak-theme/main.dev");`,
                        `} else {`,
                        `    import("./main-app");`,
                        `}`,
                        ``
                    ].join("\n")
                },
                {
                    relativeFilePath: pathJoin(KEYCLOAK_THEME, "main.dev.tsx"),
                    fileContent: `export {};\n`
                },
                {
                    relativeFilePath: pathJoin(KEYCLOAK_THEME, "main.tsx"),
                    fileContent: [
                        `import { createRoot } from "react-dom/client";`,
                        `import { StrictMode } from "react";`,
                        `import { KcPage } from "./kc.gen";`,
                        ``,
                        `if (!window.kcContext) {`,
                        `    throw new Error("No Keycloak context");`,
                        `}`,
                        ``,
                        `createRoot(document.getElementById("root")!).render(`,
                        `    <StrictMode>`,
                        `        <KcPage kcContext={window.kcContext} />`,
                        `    </StrictMode>`,
                        `);`,
                        ``
                    ].join("\n")
                }
            ];
        }

        for (let { relativeFilePath, fileContent } of files) {
            const filePath = pathJoin(srcDirPath, relativeFilePath);

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

    add_script: {
        const parsedPackageJson = await (async () => {
            type ParsedPackageJson = {
                scripts: Record<string, string>;
            };

            const zParsedPackageJson = (() => {
                type TargetType = ParsedPackageJson;

                const zTargetType = z.object({
                    scripts: z.record(z.string(), z.string())
                });

                assert<Equals<z.infer<typeof zTargetType>, TargetType>>();

                return id<z.ZodType<TargetType>>(zTargetType);
            })();

            const parsedPackageJson = JSON.parse(
                (await fs.readFile(buildContext.packageJsonFilePath)).toString("utf8")
            );

            zParsedPackageJson.parse(parsedPackageJson);

            assert(is<ParsedPackageJson>(parsedPackageJson));

            return parsedPackageJson;
        })();

        const SCRIPT_NAME = "build-keycloak-theme";

        if (SCRIPT_NAME in parsedPackageJson.scripts) {
            break add_script;
        }

        parsedPackageJson.scripts[SCRIPT_NAME] = "npm run build && keycloakify build";
        if (doAddRunDevScript) {
            parsedPackageJson.scripts["dev-keycloak-theme"] =
                "VITE_KC_DEV=true npm run dev";
        }

        let packageJson_content = JSON.stringify(parsedPackageJson, null, 2);

        run_prettier: {
            if (!(await getIsPrettierAvailable())) {
                break run_prettier;
            }

            packageJson_content = await runPrettier({
                filePath: buildContext.packageJsonFilePath,
                sourceCode: packageJson_content
            });
        }

        await fs.writeFile(
            buildContext.packageJsonFilePath,
            Buffer.from(packageJson_content, "utf8")
        );
    }

    const themeType = await (async () => {
        const values = ([...THEME_TYPES, "email"] as const).filter(themeType => {
            const wrap = buildContext.implementedThemeTypes[themeType];

            return !wrap.isImplemented && !wrap.isImplemented_native;
        });

        if (values.length === 0) {
            return undefined;
        }

        console.log(chalk.cyan(`\nWhich theme theme type would you like to initialize?`));

        const { value } = await cliSelect({
            values
        }).catch(() => {
            process.exit(-1);
        });

        return value;
    })();

    if (themeType === undefined) {
        console.log(
            chalk.gray("You already have implemented a theme type of every kind, exiting")
        );
        process.exit(0);
    }

    switch (themeType) {
        case "account":
            {
                const { command } = await import("../initialize-account-theme");

                await command({ buildContext });
            }
            return;
        case "admin":
            {
                const { command } = await import("../initialize-admin-theme");

                await command({ buildContext });
            }
            return;
        case "email":
            {
                const { command } = await import("../initialize-email-theme");

                await command({ buildContext });
            }
            return;
        case "login":
            {
                const { command } = await import("../initialize-login-theme");

                await command({ buildContext });
            }
            return;
    }

    assert<Equals<typeof themeType, never>>;
}
