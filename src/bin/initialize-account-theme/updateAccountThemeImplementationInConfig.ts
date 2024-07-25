import { join as pathJoin } from "path";
import { assert, type Equals } from "tsafe/assert";
import type { BuildContext } from "../shared/buildContext";
import * as fs from "fs";
import chalk from "chalk";
import { z } from "zod";
import { id } from "tsafe/id";

export type BuildContextLike = {
    bundler: BuildContext["bundler"];
};

assert<BuildContext extends BuildContextLike ? true : false>();

export function updateAccountThemeImplementationInConfig(params: {
    buildContext: BuildContext;
    accountThemeType: "Single-Page" | "Multi-Page";
}) {
    const { buildContext, accountThemeType } = params;

    switch (buildContext.bundler) {
        case "vite":
            {
                const viteConfigPath = pathJoin(
                    buildContext.projectDirPath,
                    "vite.config.ts"
                );

                if (!fs.existsSync(viteConfigPath)) {
                    console.log(
                        chalk.bold(
                            `You must manually set the accountThemeImplementation to "${accountThemeType}" in your vite config`
                        )
                    );
                    break;
                }

                const viteConfigContent = fs
                    .readFileSync(viteConfigPath)
                    .toString("utf8");

                const modifiedViteConfigContent = viteConfigContent.replace(
                    /accountThemeImplementation\s*:\s*"none"/,
                    `accountThemeImplementation: "${accountThemeType}"`
                );

                if (modifiedViteConfigContent === viteConfigContent) {
                    console.log(
                        chalk.bold(
                            `You must manually set the accountThemeImplementation to "${accountThemeType}" in your vite.config.ts`
                        )
                    );
                    break;
                }

                fs.writeFileSync(viteConfigPath, modifiedViteConfigContent);
            }
            break;
        case "webpack":
            {
                const parsedPackageJson = (() => {
                    type ParsedPackageJson = {
                        keycloakify: Record<string, string>;
                    };

                    const zParsedPackageJson = (() => {
                        type TargetType = ParsedPackageJson;

                        const zTargetType = z.object({
                            keycloakify: z.record(z.string())
                        });

                        assert<Equals<z.infer<typeof zTargetType>, TargetType>>();

                        return id<z.ZodType<TargetType>>(zTargetType);
                    })();

                    return zParsedPackageJson.parse(
                        JSON.parse(
                            fs
                                .readFileSync(buildContext.packageJsonFilePath)
                                .toString("utf8")
                        )
                    );
                })();

                parsedPackageJson.keycloakify.accountThemeImplementation =
                    accountThemeType;
            }
            break;
    }
}
