import type { BuildContext } from "./shared/buildContext";
import * as fs from "fs/promises";
import { join as pathJoin } from "path";
import { existsAsync } from "./tools/fs.existsAsync";
import { maybeDelegateCommandToCustomHandler } from "./shared/customHandler_delegate";
import * as crypto from "crypto";
import { getIsPrettierAvailable, runPrettier } from "./tools/runPrettier";
import { assert, type Equals } from "tsafe/assert";
import { WELL_KNOWN_DIRECTORY_BASE_NAME } from "./shared/constants";
import { readPackageJsonDependencies } from "./tools/listInstalledModules";

export async function command(params: { buildContext: BuildContext }) {
    const { buildContext } = params;

    run_copy_assets_to_public: {
        if (buildContext.bundler !== "webpack") {
            break run_copy_assets_to_public;
        }

        const { command } = await import("./copy-keycloak-resources-to-public");

        await command({ buildContext });
    }

    const { hasBeenHandled } = await maybeDelegateCommandToCustomHandler({
        commandName: "update-kc-gen",
        buildContext
    });

    if (hasBeenHandled) {
        return;
    }

    const filePath = pathJoin(buildContext.themeSrcDirPath, "kc.gen.tsx");

    const hasLoginTheme = buildContext.implementedThemeTypes.login.isImplemented;
    const hasAccountTheme = buildContext.implementedThemeTypes.account.isImplemented;
    const hasAdminTheme = buildContext.implementedThemeTypes.admin.isImplemented;

    let newContent: string;

    set_new_content: {
        if (!hasLoginTheme && !hasAccountTheme && !hasAdminTheme) {
            newContent = [
                ``,
                `/* eslint-disable */`,
                ``,
                `// @ts-nocheck`,
                ``,
                `// noinspection JSUnusedGlobalSymbols`,
                ``,
                `export function KcPage(_props: { kcContext: any; }){`,
                `    return null;`,
                `}`,
                ``,
                `declare global {`,
                `    interface Window {`,
                `        kcContext?: KcContext;`,
                `    }`,
                `}`,
                ``
            ].join("\n");

            break set_new_content;
        }

        newContent = [
            ``,
            `/* eslint-disable */`,
            ``,
            `// @ts-nocheck`,
            ``,
            `// noinspection JSUnusedGlobalSymbols`,
            ``,
            `import { lazy, Suspense, type ReactNode } from "react";`,
            ``,
            `export type ThemeName = ${buildContext.themeNames.map(themeName => `"${themeName}"`).join(" | ")};`,
            ``,
            `export const themeNames: ThemeName[] = [${buildContext.themeNames.map(themeName => `"${themeName}"`).join(", ")}];`,
            ``,
            `export type KcEnvName = ${buildContext.environmentVariables.length === 0 ? "never" : buildContext.environmentVariables.map(({ name }) => `"${name}"`).join(" | ")};`,
            ``,
            `export const kcEnvNames: KcEnvName[] = [${buildContext.environmentVariables.map(({ name }) => `"${name}"`).join(", ")}];`,
            ``,
            `export const kcEnvDefaults: Record<KcEnvName, string> = ${JSON.stringify(
                Object.fromEntries(
                    buildContext.environmentVariables.map(
                        ({ name, default: defaultValue }) => [name, defaultValue]
                    )
                ),
                null,
                2
            )};`,
            ``,
            `/**`,
            ` * NOTE: Do not import this type except maybe in your entrypoint. `,
            ` * If you need to import the KcContext import it either from src/login/KcContext.ts or src/account/KcContext.ts.`,
            ` * Depending on the theme type you are working on.`,
            ` */`,
            `export type KcContext =`,
            hasLoginTheme && `    | import("./login/KcContext").KcContext`,
            hasAccountTheme && `    | import("./account/KcContext").KcContext`,
            hasAdminTheme && `    | import("./admin/KcContext").KcContext`,
            `    ;`,
            ``,
            `declare global {`,
            `    interface Window {`,
            `        kcContext?: KcContext;`,
            `    }`,
            `}`,
            ``,
            hasLoginTheme &&
                `export const KcLoginPage = lazy(() => import("./login/KcPage"));`,
            hasAccountTheme &&
                `export const KcAccountPage = lazy(() => import("./account/KcPage"));`,
            hasAdminTheme &&
                `export const KcAdminPage = lazy(() => import("./admin/KcPage"));`,
            ``,
            `export function KcPage(`,
            `    props: {`,
            `        kcContext: KcContext;`,
            `        fallback?: ReactNode;`,
            `    }`,
            `) {`,
            `    const { kcContext, fallback } = props;`,
            `    return (`,
            `        <Suspense fallback={fallback}>`,
            `            {(() => {`,
            `                switch (kcContext.themeType) {`,
            hasLoginTheme &&
                `                    case "login": return <KcLoginPage kcContext={kcContext} />;`,
            hasAccountTheme &&
                `                    case "account": return <KcAccountPage kcContext={kcContext} />;`,
            hasAdminTheme &&
                `                    case "admin": return <KcAdminPage kcContext={kcContext} />;`,
            `                }`,
            `            })()}`,
            `        </Suspense>`,
            `    );`,
            `}`,
            ``,
            ...(() => {
                const { bundler } = buildContext;
                switch (bundler) {
                    case "vite":
                        return [
                            "// NOTE: This is exported here only because in Webpack environnement it works differently",
                            `export const BASE_URL = import.meta.env.BASE_URL`
                        ];
                    case "webpack":
                        return [
                            "// NOTE: This is a polyfill for `import.meta.env.BASE_URL` as it's not available in Webpack environment.",
                            "export const BASE_URL =",
                            `    window.kcContext === undefined || process.env.NODE_ENV === "development"`,
                            `        ? process.env.PUBLIC_URL === ""`,
                            `            ? "/"`,
                            `            : \`${process.env.PUBLIC_URL}/\``,
                            `        : \`\${kcContext["x-keycloakify"].resourcesPath}/${WELL_KNOWN_DIRECTORY_BASE_NAME.DIST}/\`;`,
                            ""
                        ];
                    default:
                        assert<Equals<typeof bundler, never>>(false);
                }
            })(),
            await (async () => {
                const { dependencies, devDependencies } =
                    await readPackageJsonDependencies({
                        packageJsonFilePath: buildContext.packageJsonFilePath
                    });

                const moduleNames = Object.keys({
                    ...dependencies,
                    ...devDependencies
                });

                const moduleName = (() => {
                    for (const moduleName_candidate of [
                        "@storybook/react-vite",
                        "@storybook/react-webpack5",
                        "@storybook/react"
                    ]) {
                        if (moduleNames.includes(moduleName_candidate)) {
                            return moduleName_candidate;
                        }
                    }

                    return undefined;
                })();

                if (moduleName === undefined) {
                    return false as const;
                }

                return [
                    `// NOTE: This is only exported here because you're supposed to import type from different packages`,
                    `// Depending of if you are using Vite, Webpack, ect...`,
                    `export type { Meta, StoryObj } from "${moduleName}";`,
                    ``
                ].join("\n");
            })()
        ]
            .filter(item => {
                assert<Equals<typeof item, string | false>>;
                return typeof item === "string";
            })
            .join("\n");
    }

    const hash = crypto.createHash("sha256").update(newContent).digest("hex");

    skip_if_no_changes: {
        if (!(await existsAsync(filePath))) {
            break skip_if_no_changes;
        }

        const currentContent = (await fs.readFile(filePath)).toString("utf8");

        if (!currentContent.includes(hash)) {
            break skip_if_no_changes;
        }

        return;
    }

    newContent = [
        `// This file is auto-generated by the \`update-kc-gen\` command. Do not edit it manually.`,
        `// Hash: ${hash}`,
        ``,
        newContent
    ].join("\n");

    format: {
        if (!(await getIsPrettierAvailable())) {
            break format;
        }

        newContent = await runPrettier({
            filePath,
            sourceCode: newContent
        });
    }

    await fs.writeFile(filePath, Buffer.from(newContent, "utf8"));

    delete_legacy_file: {
        const legacyFilePath = filePath.replace(/tsx$/, "ts");

        if (!(await existsAsync(legacyFilePath))) {
            break delete_legacy_file;
        }

        await fs.unlink(legacyFilePath);
    }
}
