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

/** Consolidated build option gathered form CLI arguments and config in package.json */
export type BuildOptions = {
    bundler: "vite" | "webpack";
    isSilent: boolean;
    themeVersion: string;
    themeNames: string[];
    extraThemeProperties: string[] | undefined;
    groupId: string;
    artifactId: string;
    loginThemeResourcesFromKeycloakVersion: string;
    reactAppRootDirPath: string;
    // TODO: Remove from vite type
    reactAppBuildDirPath: string;
    /** Directory that keycloakify outputs to. Defaults to {cwd}/build_keycloak */
    keycloakifyBuildDirPath: string;
    publicDirPath: string;
    cacheDirPath: string;
    /** If your app is hosted under a subpath, it's the case in CRA if you have "homepage": "https://example.com/my-app" in your package.json
     * In this case the urlPathname will be "/my-app/" */
    urlPathname: string | undefined;
    assetsDirPath: string;
    npmWorkspaceRootDirPath: string;
};

export type UserProvidedBuildOptions = {
    extraThemeProperties?: string[];
    artifactId?: string;
    groupId?: string;
    loginThemeResourcesFromKeycloakVersion?: string;
    keycloakifyBuildDirPath?: string;
    themeName?: string | string[];
};

export type ResolvedViteConfig = {
    buildDir: string;
    publicDir: string;
    assetsDir: string;
    urlPathname: string | undefined;
    userProvidedBuildOptions: UserProvidedBuildOptions;
};

export function readBuildOptions(params: { cliCommandOptions: CliCommandOptions }): BuildOptions {
    const { cliCommandOptions } = params;

    const reactAppRootDirPath = (() => {
        if (cliCommandOptions.reactAppRootDirPath === undefined) {
            return process.cwd();
        }

        return getAbsoluteAndInOsFormatPath({
            "pathIsh": cliCommandOptions.reactAppRootDirPath,
            "cwd": process.cwd()
        });
    })();

    const { resolvedViteConfig } = (() => {
        if (fs.readdirSync(reactAppRootDirPath).find(fileBasename => fileBasename.startsWith("vite.config")) === undefined) {
            return { "resolvedViteConfig": undefined };
        }

        const output = child_process
            .execSync("npx vite", {
                "cwd": reactAppRootDirPath,
                "env": {
                    ...process.env,
                    [vitePluginSubScriptEnvNames.resolveViteConfig]: "true"
                }
            })
            .toString("utf8");

        assert(output.includes(vitePluginSubScriptEnvNames.resolveViteConfig), "Seems like the Keycloakify's Vite plugin is not installed.");

        const resolvedViteConfigStr = output.split(vitePluginSubScriptEnvNames.resolveViteConfig).reverse()[0];

        const resolvedViteConfig: ResolvedViteConfig = JSON.parse(resolvedViteConfigStr);

        return { resolvedViteConfig };
    })();

    const parsedPackageJson = (() => {
        type ParsedPackageJson = {
            name: string;
            version?: string;
            homepage?: string;
            keycloakify?: UserProvidedBuildOptions & { reactAppBuildDirPath?: string };
        };

        const zParsedPackageJson = z.object({
            "name": z.string(),
            "version": z.string().optional(),
            "homepage": z.string().optional(),
            "keycloakify": z
                .object({
                    "extraThemeProperties": z.array(z.string()).optional(),
                    "artifactId": z.string().optional(),
                    "groupId": z.string().optional(),
                    "loginThemeResourcesFromKeycloakVersion": z.string().optional(),
                    "reactAppBuildDirPath": z.string().optional(),
                    "keycloakifyBuildDirPath": z.string().optional(),
                    "themeName": z.union([z.string(), z.array(z.string())]).optional()
                })
                .optional()
        });

        {
            type Got = ReturnType<(typeof zParsedPackageJson)["parse"]>;
            type Expected = ParsedPackageJson;
            assert<Got extends Expected ? true : false>();
            assert<Expected extends Got ? true : false>();
        }

        return zParsedPackageJson.parse(JSON.parse(fs.readFileSync(pathJoin(reactAppRootDirPath, "package.json")).toString("utf8")));
    })();

    const userProvidedBuildOptions: UserProvidedBuildOptions = {
        ...parsedPackageJson.keycloakify,
        ...resolvedViteConfig?.userProvidedBuildOptions
    };

    const themeNames = (() => {
        if (userProvidedBuildOptions.themeName === undefined) {
            return [
                parsedPackageJson.name
                    .replace(/^@(.*)/, "$1")
                    .split("/")
                    .join("-")
            ];
        }

        if (typeof userProvidedBuildOptions.themeName === "string") {
            return [userProvidedBuildOptions.themeName];
        }

        return userProvidedBuildOptions.themeName;
    })();

    const reactAppBuildDirPath = (() => {
        webpack: {
            if (resolvedViteConfig !== undefined) {
                break webpack;
            }

            if (parsedPackageJson.keycloakify?.reactAppBuildDirPath !== undefined) {
                return getAbsoluteAndInOsFormatPath({
                    "pathIsh": parsedPackageJson.keycloakify.reactAppBuildDirPath,
                    "cwd": reactAppRootDirPath
                });
            }

            return pathJoin(reactAppRootDirPath, "build");
        }

        return pathJoin(reactAppRootDirPath, resolvedViteConfig.buildDir);
    })();

    const { npmWorkspaceRootDirPath } = getNpmWorkspaceRootDirPath({ reactAppRootDirPath });

    return {
        "bundler": resolvedViteConfig !== undefined ? "vite" : "webpack",
        "isSilent": cliCommandOptions.isSilent,
        "themeVersion": process.env.KEYCLOAKIFY_THEME_VERSION ?? parsedPackageJson.version ?? "0.0.0",
        themeNames,
        "extraThemeProperties": userProvidedBuildOptions.extraThemeProperties,
        "groupId": (() => {
            const fallbackGroupId = `${themeNames[0]}.keycloak`;

            return (
                process.env.KEYCLOAKIFY_GROUP_ID ??
                userProvidedBuildOptions.groupId ??
                (parsedPackageJson.homepage === undefined
                    ? fallbackGroupId
                    : urlParse(parsedPackageJson.homepage)
                          .host?.replace(/:[0-9]+$/, "")
                          ?.split(".")
                          .reverse()
                          .join(".") ?? fallbackGroupId) + ".keycloak"
            );
        })(),
        "artifactId": process.env.KEYCLOAKIFY_ARTIFACT_ID ?? userProvidedBuildOptions.artifactId ?? `${themeNames[0]}-keycloak-theme`,
        "loginThemeResourcesFromKeycloakVersion": userProvidedBuildOptions.loginThemeResourcesFromKeycloakVersion ?? "24.0.4",
        reactAppRootDirPath,
        reactAppBuildDirPath,
        "keycloakifyBuildDirPath": (() => {
            if (userProvidedBuildOptions.keycloakifyBuildDirPath !== undefined) {
                return getAbsoluteAndInOsFormatPath({
                    "pathIsh": userProvidedBuildOptions.keycloakifyBuildDirPath,
                    "cwd": reactAppRootDirPath
                });
            }

            return pathJoin(
                reactAppRootDirPath,
                resolvedViteConfig?.buildDir === undefined ? "build_keycloak" : `${resolvedViteConfig.buildDir}_keycloak`
            );
        })(),
        "publicDirPath": (() => {
            webpack: {
                if (resolvedViteConfig !== undefined) {
                    break webpack;
                }

                if (process.env.PUBLIC_DIR_PATH !== undefined) {
                    return getAbsoluteAndInOsFormatPath({
                        "pathIsh": process.env.PUBLIC_DIR_PATH,
                        "cwd": reactAppRootDirPath
                    });
                }

                return pathJoin(reactAppRootDirPath, "public");
            }

            return pathJoin(reactAppRootDirPath, resolvedViteConfig.publicDir);
        })(),
        "cacheDirPath": (() => {
            const cacheDirPath = pathJoin(
                (() => {
                    if (process.env.XDG_CACHE_HOME !== undefined) {
                        return getAbsoluteAndInOsFormatPath({
                            "pathIsh": process.env.XDG_CACHE_HOME,
                            "cwd": reactAppRootDirPath
                        });
                    }

                    return pathJoin(npmWorkspaceRootDirPath, "node_modules", ".cache");
                })(),
                "keycloakify"
            );

            return cacheDirPath;
        })(),
        "urlPathname": (() => {
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
        "assetsDirPath": (() => {
            webpack: {
                if (resolvedViteConfig !== undefined) {
                    break webpack;
                }

                return pathJoin(reactAppBuildDirPath, "static");
            }

            return pathJoin(reactAppBuildDirPath, resolvedViteConfig.assetsDir);
        })(),
        npmWorkspaceRootDirPath
    };
}
