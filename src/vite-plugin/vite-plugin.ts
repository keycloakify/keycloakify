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
    getBuildContext,
    type BuildContext,
    type BuildOptions,
    type ResolvedViteConfig
} from "../bin/shared/buildContext";
import MagicString from "magic-string";
import { generateKcGenTs } from "../bin/shared/generateKcGenTs";

export type Params = BuildOptions & {
    postBuild?: (buildContext: Omit<BuildContext, "bundler">) => Promise<void>;
};

export function keycloakify(params?: Params) {
    const { postBuild, ...buildOptions } = params ?? {};

    let projectDirPath: string | undefined = undefined;
    let urlPathname: string | undefined = undefined;
    let buildDirPath: string | undefined = undefined;
    let command: "build" | "serve" | undefined = undefined;
    let shouldGenerateSourcemap: boolean | undefined = undefined;

    const plugin = {
        name: "keycloakify",
        configResolved: async resolvedConfig => {
            shouldGenerateSourcemap = resolvedConfig.build.sourcemap !== false;

            run_post_build_script_case: {
                const envValue =
                    process.env[vitePluginSubScriptEnvNames.runPostBuildScript];

                if (envValue === undefined) {
                    break run_post_build_script_case;
                }

                if (postBuild === undefined) {
                    break run_post_build_script_case;
                }

                const buildContext = JSON.parse(envValue) as BuildContext;

                const cwd = process.cwd();

                process.chdir(
                    pathJoin(buildContext.keycloakifyBuildDirPath, "resources")
                );

                await postBuild(buildContext);

                process.chdir(cwd);

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
                            buildOptions
                        })
                    )
                );

                process.exit(0);
            }

            const buildContext = getBuildContext({
                cliCommandOptions: {
                    projectDirPath
                }
            });

            await Promise.all([
                copyKeycloakResourcesToPublic({
                    buildContext
                }),
                generateKcGenTs({
                    buildContext
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
