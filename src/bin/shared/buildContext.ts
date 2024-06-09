import { parse as urlParse } from "url";
import { join as pathJoin } from "path";
import { getAbsoluteAndInOsFormatPath } from "../tools/getAbsoluteAndInOsFormatPath";
import { getNpmWorkspaceRootDirPath } from "../tools/getNpmWorkspaceRootDirPath";
import type { CliCommandOptions } from "../main";
import { z } from "zod";
import * as fs from "fs";
import { assert } from "tsafe";
import * as child_process from "child_process";
import { vitePluginSubScriptEnvNames } from "./constants";

export type BuildContext = {
    bundler: "vite" | "webpack";
    themeVersion: string;
    themeNames: string[];
    extraThemeProperties: string[] | undefined;
    groupId: string;
    artifactId: string;
    loginThemeResourcesFromKeycloakVersion: string;
    projectDirPath: string;
    projectBuildDirPath: string;
    /** Directory that keycloakify outputs to. Defaults to {cwd}/build_keycloak */
    keycloakifyBuildDirPath: string;
    publicDirPath: string;
    cacheDirPath: string;
    /** If your app is hosted under a subpath, it's the case in CRA if you have "homepage": "https://example.com/my-app" in your package.json
     * In this case the urlPathname will be "/my-app/" */
    urlPathname: string | undefined;
    assetsDirPath: string;
    npmWorkspaceRootDirPath: string;
    kcContextExclusionsFtlCode: string | undefined;
    environmentVariables: { name: string; default: string }[];
};

export type BuildOptions = {
    themeName?: string | string[];
    environmentVariables?: { name: string; default: string }[];
    extraThemeProperties?: string[];
    artifactId?: string;
    groupId?: string;
    loginThemeResourcesFromKeycloakVersion?: string;
    keycloakifyBuildDirPath?: string;
    kcContextExclusionsFtlCode?: string;
};

export type ResolvedViteConfig = {
    buildDir: string;
    publicDir: string;
    assetsDir: string;
    urlPathname: string | undefined;
    buildOptions: BuildOptions;
};

export function getBuildContext(params: {
    cliCommandOptions: CliCommandOptions;
}): BuildContext {
    const { cliCommandOptions } = params;

    const projectDirPath = (() => {
        if (cliCommandOptions.projectDirPath === undefined) {
            return process.cwd();
        }

        return getAbsoluteAndInOsFormatPath({
            pathIsh: cliCommandOptions.projectDirPath,
            cwd: process.cwd()
        });
    })();

    const { resolvedViteConfig } = (() => {
        if (
            fs
                .readdirSync(projectDirPath)
                .find(fileBasename => fileBasename.startsWith("vite.config")) ===
            undefined
        ) {
            return { resolvedViteConfig: undefined };
        }

        const output = child_process
            .execSync("npx vite", {
                cwd: projectDirPath,
                env: {
                    ...process.env,
                    [vitePluginSubScriptEnvNames.resolveViteConfig]: "true"
                }
            })
            .toString("utf8");

        assert(
            output.includes(vitePluginSubScriptEnvNames.resolveViteConfig),
            "Seems like the Keycloakify's Vite plugin is not installed."
        );

        const resolvedViteConfigStr = output
            .split(vitePluginSubScriptEnvNames.resolveViteConfig)
            .reverse()[0];

        const resolvedViteConfig: ResolvedViteConfig = JSON.parse(resolvedViteConfigStr);

        return { resolvedViteConfig };
    })();

    const parsedPackageJson = (() => {
        type ParsedPackageJson = {
            name: string;
            version?: string;
            homepage?: string;
            keycloakify?: BuildOptions & {
                projectBuildDirPath?: string;
            };
        };

        const zParsedPackageJson = z.object({
            name: z.string(),
            version: z.string().optional(),
            homepage: z.string().optional(),
            keycloakify: z
                .object({
                    extraThemeProperties: z.array(z.string()).optional(),
                    artifactId: z.string().optional(),
                    groupId: z.string().optional(),
                    loginThemeResourcesFromKeycloakVersion: z.string().optional(),
                    projectBuildDirPath: z.string().optional(),
                    keycloakifyBuildDirPath: z.string().optional(),
                    themeName: z.union([z.string(), z.array(z.string())]).optional()
                })
                .optional()
        });

        {
            type Got = ReturnType<(typeof zParsedPackageJson)["parse"]>;
            type Expected = ParsedPackageJson;
            assert<Got extends Expected ? true : false>();
            assert<Expected extends Got ? true : false>();
        }

        return zParsedPackageJson.parse(
            JSON.parse(
                fs.readFileSync(pathJoin(projectDirPath, "package.json")).toString("utf8")
            )
        );
    })();

    const buildOptions: BuildOptions = {
        ...parsedPackageJson.keycloakify,
        ...resolvedViteConfig?.buildOptions
    };

    const themeNames = (() => {
        if (buildOptions.themeName === undefined) {
            return [
                parsedPackageJson.name
                    .replace(/^@(.*)/, "$1")
                    .split("/")
                    .join("-")
            ];
        }

        if (typeof buildOptions.themeName === "string") {
            return [buildOptions.themeName];
        }

        return buildOptions.themeName;
    })();

    const projectBuildDirPath = (() => {
        webpack: {
            if (resolvedViteConfig !== undefined) {
                break webpack;
            }

            if (parsedPackageJson.keycloakify?.projectBuildDirPath !== undefined) {
                return getAbsoluteAndInOsFormatPath({
                    pathIsh: parsedPackageJson.keycloakify.projectBuildDirPath,
                    cwd: projectDirPath
                });
            }

            return pathJoin(projectDirPath, "build");
        }

        return pathJoin(projectDirPath, resolvedViteConfig.buildDir);
    })();

    const { npmWorkspaceRootDirPath } = getNpmWorkspaceRootDirPath({
        projectDirPath,
        dependencyExpected: "keycloakify"
    });

    return {
        bundler: resolvedViteConfig !== undefined ? "vite" : "webpack",
        themeVersion:
            process.env.KEYCLOAKIFY_THEME_VERSION ?? parsedPackageJson.version ?? "0.0.0",
        themeNames,
        extraThemeProperties: buildOptions.extraThemeProperties,
        groupId: (() => {
            const fallbackGroupId = `${themeNames[0]}.keycloak`;

            return (
                process.env.KEYCLOAKIFY_GROUP_ID ??
                buildOptions.groupId ??
                (parsedPackageJson.homepage === undefined
                    ? fallbackGroupId
                    : urlParse(parsedPackageJson.homepage)
                          .host?.replace(/:[0-9]+$/, "")
                          ?.split(".")
                          .reverse()
                          .join(".") ?? fallbackGroupId) + ".keycloak"
            );
        })(),
        artifactId:
            process.env.KEYCLOAKIFY_ARTIFACT_ID ??
            buildOptions.artifactId ??
            `${themeNames[0]}-keycloak-theme`,
        loginThemeResourcesFromKeycloakVersion:
            buildOptions.loginThemeResourcesFromKeycloakVersion ?? "24.0.4",
        projectDirPath,
        projectBuildDirPath,
        keycloakifyBuildDirPath: (() => {
            if (buildOptions.keycloakifyBuildDirPath !== undefined) {
                return getAbsoluteAndInOsFormatPath({
                    pathIsh: buildOptions.keycloakifyBuildDirPath,
                    cwd: projectDirPath
                });
            }

            return pathJoin(
                projectDirPath,
                resolvedViteConfig?.buildDir === undefined
                    ? "build_keycloak"
                    : `${resolvedViteConfig.buildDir}_keycloak`
            );
        })(),
        publicDirPath: (() => {
            webpack: {
                if (resolvedViteConfig !== undefined) {
                    break webpack;
                }

                if (process.env.PUBLIC_DIR_PATH !== undefined) {
                    return getAbsoluteAndInOsFormatPath({
                        pathIsh: process.env.PUBLIC_DIR_PATH,
                        cwd: projectDirPath
                    });
                }

                return pathJoin(projectDirPath, "public");
            }

            return pathJoin(projectDirPath, resolvedViteConfig.publicDir);
        })(),
        cacheDirPath: (() => {
            const cacheDirPath = pathJoin(
                (() => {
                    if (process.env.XDG_CACHE_HOME !== undefined) {
                        return getAbsoluteAndInOsFormatPath({
                            pathIsh: process.env.XDG_CACHE_HOME,
                            cwd: process.cwd()
                        });
                    }

                    return pathJoin(npmWorkspaceRootDirPath, "node_modules", ".cache");
                })(),
                "keycloakify"
            );

            return cacheDirPath;
        })(),
        urlPathname: (() => {
            webpack: {
                if (resolvedViteConfig !== undefined) {
                    break webpack;
                }

                const { homepage } = parsedPackageJson;

                let url: URL | undefined = undefined;

                if (homepage !== undefined) {
                    url = new URL(homepage);
                }

                if (url === undefined) {
                    return undefined;
                }

                const out = url.pathname.replace(/([^/])$/, "$1/");
                return out === "/" ? undefined : out;
            }

            return resolvedViteConfig.urlPathname;
        })(),
        assetsDirPath: (() => {
            webpack: {
                if (resolvedViteConfig !== undefined) {
                    break webpack;
                }

                return pathJoin(projectBuildDirPath, "static");
            }

            return pathJoin(projectBuildDirPath, resolvedViteConfig.assetsDir);
        })(),
        npmWorkspaceRootDirPath,
        kcContextExclusionsFtlCode: buildOptions.kcContextExclusionsFtlCode,
        environmentVariables: buildOptions.environmentVariables ?? []
    };
}
