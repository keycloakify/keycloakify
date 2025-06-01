import { join as pathJoin, relative as pathRelative, sep as pathSep } from "path";
import type { Plugin } from "vite";
import {
    WELL_KNOWN_DIRECTORY_BASE_NAME,
    VITE_PLUGIN_SUB_SCRIPTS_ENV_NAMES,
    KEYCLOAK_THEME
} from "../bin/shared/constants";
import { id } from "tsafe/id";
import { rm } from "../bin/tools/fs.rm";
import { command as copyKeycloakResourcesToPublicCommand } from "../bin/copy-keycloak-resources-to-public";
import { assert } from "tsafe/assert";
import {
    getBuildContext,
    type BuildContext,
    type BuildOptions,
    type ResolvedViteConfig
} from "../bin/shared/buildContext";
import MagicString from "magic-string";
import { command as updateKcGenCommand } from "../bin/update-kc-gen";
import { replaceAll } from "../bin/tools/String.prototype.replaceAll";

export namespace keycloakify {
    export type Params = BuildOptions & {
        postBuild?: (buildContext: Omit<BuildContext, "bundler">) => Promise<void>;
    };
}

export function keycloakify(params: keycloakify.Params) {
    const { postBuild, ...buildOptions } = params;

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
                    process.env[VITE_PLUGIN_SUB_SCRIPTS_ENV_NAMES.RUN_POST_BUILD_SCRIPT];

                if (envValue === undefined) {
                    break run_post_build_script_case;
                }

                const { buildContext, resourcesDirPath } = JSON.parse(envValue) as {
                    buildContext: BuildContext;
                    resourcesDirPath: string;
                };

                process.chdir(resourcesDirPath);

                await postBuild?.(buildContext);

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
                    process.env[VITE_PLUGIN_SUB_SCRIPTS_ENV_NAMES.RESOLVE_VITE_CONFIG];

                if (envValue === undefined) {
                    break resolve_vite_config_case;
                }

                console.log(VITE_PLUGIN_SUB_SCRIPTS_ENV_NAMES.RESOLVE_VITE_CONFIG);

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
                projectDirPath
            });

            await copyKeycloakResourcesToPublicCommand({ buildContext });

            await updateKcGenCommand({ buildContext });
        },
        transform: (code, id) => {
            id = replaceAll(id, "/", pathSep);

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
                const isSvelteFile = id.endsWith(".svelte");

                if (!isTypeScriptFile && !isJavascriptFile && !isSvelteFile) {
                    return;
                }
            }

            const transformedCode = new MagicString(code);

            transformedCode.replaceAll(
                /import\.meta\.env(?:(?:\.BASE_URL)|(?:\["BASE_URL"\]))/g,
                [
                    `(`,
                    `(window.kcContext === undefined || import.meta.env.MODE === "development")?`,
                    `import.meta.env.BASE_URL:`,
                    `(window.kcContext["x-keycloakify"].resourcesPath + "/${WELL_KNOWN_DIRECTORY_BASE_NAME.DIST}/")`,
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

            // NOTE: This is legacy and should eventually be removed
            await rm(
                pathJoin(
                    buildDirPath,
                    WELL_KNOWN_DIRECTORY_BASE_NAME.KEYCLOAKIFY_DEV_RESOURCES
                ),
                {
                    recursive: true,
                    force: true
                }
            );

            await rm(pathJoin(buildDirPath, KEYCLOAK_THEME), {
                recursive: true,
                force: true
            });
        },
        transformIndexHtml: html => {
            const doReadKcContextFromUrl =
                process.env.NODE_ENV === "development" &&
                process.env[
                    VITE_PLUGIN_SUB_SCRIPTS_ENV_NAMES.READ_KC_CONTEXT_FROM_URL
                ] === "true";

            if (!doReadKcContextFromUrl) {
                return html;
            }

            const scriptContent = `
(()=>{

    const url = new URL(window.location.href);

    const kcContext_str = url.searchParams.get("kcContext");

    if( kcContext_str === null ){

        const keycloakServerPort = sessionStorage.getItem("keycloakServerPort");

        if( keycloakServerPort === null ){
            return;
        }

        const redirectUrl = new URL(window.location.href);

        redirectUrl.port = keycloakServerPort;

        window.location.href = redirectUrl;

        return;

    }

    url.searchParams.delete("kcContext");

    {

        const keycloakServerPort = url.searchParams.get("keycloakServerPort");

        if( keycloakServerPort === null ){
            throw new Error("Wrong assertion");
        }

        sessionStorage.setItem("keycloakServerPort", keycloakServerPort);
        url.searchParams.delete("keycloakServerPort");

    }

    window.history.replaceState({}, "", url);

    window.kcContext = JSON.parse(kcContext_str);

})();
`;

            return html.replace(/<head>/, `<head><script>${scriptContent}</script>`);
        }
    } satisfies Plugin;

    return plugin as any;
}
