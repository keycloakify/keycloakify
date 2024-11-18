import { join as pathJoin } from "path";
import { assert, type Equals, is } from "tsafe/assert";
import type { BuildContext } from "../shared/buildContext";
import * as fs from "fs";
import chalk from "chalk";
import { z } from "zod";
import { id } from "tsafe/id";

export type BuildContextLike = {
    bundler: BuildContext["bundler"];
    projectDirPath: string;
    packageJsonFilePath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export function updateAccountThemeImplementationInConfig(params: {
    buildContext: BuildContextLike;
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
                        keycloakify: Record<string, unknown>;
                    };

                    const zParsedPackageJson = (() => {
                        type TargetType = ParsedPackageJson;

                        const zTargetType = z.object({
                            keycloakify: z.record(z.unknown())
                        });

                        assert<Equals<z.infer<typeof zTargetType>, TargetType>>();

                        return id<z.ZodType<TargetType>>(zTargetType);
                    })();

                    const parsedPackageJson = JSON.parse(
                        fs.readFileSync(buildContext.packageJsonFilePath).toString("utf8")
                    );

                    zParsedPackageJson.parse(parsedPackageJson);

                    assert(is<ParsedPackageJson>(parsedPackageJson));

                    return parsedPackageJson;
                })();

                parsedPackageJson.keycloakify.accountThemeImplementation =
                    accountThemeType;

                fs.writeFileSync(
                    buildContext.packageJsonFilePath,
                    Buffer.from(JSON.stringify(parsedPackageJson, undefined, 4), "utf8")
                );
            }
            break;
    }
}
