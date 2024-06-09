import { join as pathJoin, relative as pathRelative, sep as pathSep } from "path";
import type { Plugin } from "vite";
import {
    nameOfTheGlobal,
    basenameOfTheKeycloakifyResourcesDir,
    keycloak_resources,
    vitePluginSubScriptEnvNames
} from "../bin/shared/constants";
import { id } from "tsafe/id";
import { rm } from "../bin/tools/fs.rm";
import { copyKeycloakResourcesToPublic } from "../bin/shared/copyKeycloakResourcesToPublic";
import { assert } from "tsafe/assert";
import {
    readBuildOptions,
    type BuildOptions,
    type UserProvidedBuildOptions,
    type ResolvedViteConfig
} from "../bin/shared/buildOptions";
import MagicString from "magic-string";
import { generateKcGenTs } from "../bin/shared/generateKcGenTs";

export type Params = UserProvidedBuildOptions & {
    postBuild?: (buildOptions: Omit<BuildOptions, "bundler">) => Promise<void>;
};

export function keycloakify(params?: Params) {
    const { postBuild, ...userProvidedBuildOptions } = params ?? {};

    let projectDirPath: string | undefined = undefined;
    let urlPathname: string | undefined = undefined;
    let buildDirPath: string | undefined = undefined;
    let command: "build" | "serve" | undefined = undefined;
    let shouldGenerateSourcemap: boolean | undefined = undefined;

    const plugin = {
        name: "keycloakify" as const,
        configResolved: async resolvedConfig => {
            shouldGenerateSourcemap = resolvedConfig.build.sourcemap !== false;

            run_post_build_script_case: {
                const envValue =
                    process.env[vitePluginSubScriptEnvNames.runPostBuildScript];

                if (envValue === undefined) {
                    break run_post_build_script_case;
                }

                const buildOptions = JSON.parse(envValue) as BuildOptions;

                await postBuild?.(buildOptions);

                process.exit(0);
            }

            command = resolvedConfig.command;

            projectDirPath = resolvedConfig.root;
            urlPathname = (() => {
                let out = resolvedConfig.env.BASE_URL;

                if (
                    out.startsWith(".") &&
                    command === "build" &&
                    resolvedConfig.envPrefix?.includes("STORYBOOK_") !== true
                ) {
                    throw new Error(
                        [
                            `BASE_URL=${out} is not supported By Keycloakify. Use an absolute path instead.`,
                            `If this is a problem, please open an issue at https://github.com/keycloakify/keycloakify/issues/new`
                        ].join("\n")
                    );
                }

                if (out === undefined) {
                    return undefined;
                }

                if (!out.startsWith("/")) {
                    out = "/" + out;
                }

                if (!out.endsWith("/")) {
                    out += "/";
                }

                return out;
            })();

            buildDirPath = pathJoin(projectDirPath, resolvedConfig.build.outDir);

            resolve_vite_config_case: {
                const envValue =
                    process.env[vitePluginSubScriptEnvNames.resolveViteConfig];

                if (envValue === undefined) {
                    break resolve_vite_config_case;
                }

                console.log(vitePluginSubScriptEnvNames.resolveViteConfig);

                console.log(
                    JSON.stringify(
                        id<ResolvedViteConfig>({
                            publicDir: pathRelative(
                                projectDirPath,
                                resolvedConfig.publicDir
                            ),
                            assetsDir: resolvedConfig.build.assetsDir,
                            buildDir: resolvedConfig.build.outDir,
                            urlPathname,
                            userProvidedBuildOptions
                        })
                    )
                );

                process.exit(0);
            }

            const buildOptions = readBuildOptions({
                cliCommandOptions: {
                    projectDirPath
                }
            });

            await Promise.all([
                copyKeycloakResourcesToPublic({
                    buildOptions
                }),
                generateKcGenTs({
                    buildOptions
                })
            ]);
        },
        transform: (code, id) => {
            assert(command !== undefined);
            assert(shouldGenerateSourcemap !== undefined);

            if (command !== "build") {
                return;
            }

            assert(projectDirPath !== undefined);

            {
                const isWithinSourceDirectory = id.startsWith(
                    pathJoin(projectDirPath, "src") + pathSep
                );

                if (!isWithinSourceDirectory) {
                    return;
                }
            }

            {
                const isJavascriptFile = id.endsWith(".js") || id.endsWith(".jsx");
                const isTypeScriptFile = id.endsWith(".ts") || id.endsWith(".tsx");

                if (!isTypeScriptFile && !isJavascriptFile) {
                    return;
                }
            }

            const transformedCode = new MagicString(code);

            transformedCode.replaceAll(
                /import\.meta\.env(?:(?:\.BASE_URL)|(?:\["BASE_URL"\]))/g,
                [
                    `(`,
                    `(window.${nameOfTheGlobal} === undefined || import.meta.env.MODE === "development")?`,
                    `"${urlPathname ?? "/"}":`,
                    `(window.${nameOfTheGlobal}.url.resourcesPath + "/${basenameOfTheKeycloakifyResourcesDir}/")`,
                    `)`
                ].join("")
            );

            if (!transformedCode.hasChanged()) {
                return;
            }

            if (!shouldGenerateSourcemap) {
                return transformedCode.toString();
            }

            const map = transformedCode.generateMap({
                source: id,
                includeContent: true,
                hires: true
            });

            return {
                code: transformedCode.toString(),
                map: map.toString()
            };
        },
        closeBundle: async () => {
            assert(command !== undefined);

            if (command !== "build") {
                return;
            }

            assert(buildDirPath !== undefined);

            await rm(pathJoin(buildDirPath, keycloak_resources), {
                recursive: true,
                force: true
            });
        }
    } satisfies Plugin;

    return plugin as any;
}
