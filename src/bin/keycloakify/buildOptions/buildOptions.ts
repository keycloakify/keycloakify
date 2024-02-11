import { parse as urlParse } from "url";
import { readParsedPackageJson } from "./parsedPackageJson";
import { join as pathJoin } from "path";
import parseArgv from "minimist";
import { getAbsoluteAndInOsFormatPath } from "../../tools/getAbsoluteAndInOsFormatPath";
import { readResolvedViteConfig } from "./resolvedViteConfig";
import * as fs from "fs";
import { getCacheDirPath } from "./getCacheDirPath";
import { getReactAppRootDirPath } from "./getReactAppRootDirPath";

/** Consolidated build option gathered form CLI arguments and config in package.json */
export type BuildOptions = {
    bundler: "vite" | "webpack";
    isSilent: boolean;
    themeVersion: string;
    themeNames: string[];
    extraThemeProperties: string[] | undefined;
    groupId: string;
    artifactId: string;
    doCreateJar: boolean;
    loginThemeResourcesFromKeycloakVersion: string;
    reactAppRootDirPath: string;
    reactAppBuildDirPath: string;
    /** Directory that keycloakify outputs to. Defaults to {cwd}/build_keycloak */
    keycloakifyBuildDirPath: string;
    publicDirPath: string;
    cacheDirPath: string;
    /** If your app is hosted under a subpath, it's the case in CRA if you have "homepage": "https://example.com/my-app" in your package.json
     * In this case the urlPathname will be "/my-app/" */
    urlPathname: string | undefined;
    assetsDirPath: string;
    doBuildRetrocompatAccountTheme: boolean;
};

export function readBuildOptions(params: { processArgv: string[] }): BuildOptions {
    const { processArgv } = params;

    const { reactAppRootDirPath } = getReactAppRootDirPath({ processArgv });

    const { cacheDirPath } = getCacheDirPath({ reactAppRootDirPath });

    const { resolvedViteConfig } = readResolvedViteConfig({ cacheDirPath });

    if (resolvedViteConfig === undefined && fs.existsSync(pathJoin(reactAppRootDirPath, "vite.config.ts"))) {
        throw new Error("Keycloakify's Vite plugin output not found");
    }

    const parsedPackageJson = readParsedPackageJson({ reactAppRootDirPath });

    const themeNames = (() => {
        if (parsedPackageJson.keycloakify?.themeName === undefined) {
            return [
                parsedPackageJson.name
                    .replace(/^@(.*)/, "$1")
                    .split("/")
                    .join("-")
            ];
        }

        if (typeof parsedPackageJson.keycloakify.themeName === "string") {
            return [parsedPackageJson.keycloakify.themeName];
        }

        return parsedPackageJson.keycloakify.themeName;
    })();

    const reactAppBuildDirPath = (() => {
        webpack: {
            if (resolvedViteConfig !== undefined) {
                break webpack;
            }

            if (parsedPackageJson.keycloakify?.reactAppBuildDirPath !== undefined) {
                return getAbsoluteAndInOsFormatPath({
                    "pathIsh": parsedPackageJson.keycloakify?.reactAppBuildDirPath,
                    "cwd": reactAppRootDirPath
                });
            }

            return pathJoin(reactAppRootDirPath, "build");
        }

        return pathJoin(reactAppRootDirPath, resolvedViteConfig.buildDir);
    })();

    const argv = parseArgv(processArgv);

    return {
        "bundler": resolvedViteConfig !== undefined ? "vite" : "webpack",
        "isSilent": typeof argv["silent"] === "boolean" ? argv["silent"] : false,
        "themeVersion": process.env.KEYCLOAKIFY_THEME_VERSION ?? parsedPackageJson.version ?? "0.0.0",
        themeNames,
        "extraThemeProperties": parsedPackageJson.keycloakify?.extraThemeProperties,
        "groupId": (() => {
            const fallbackGroupId = `${themeNames[0]}.keycloak`;

            return (
                process.env.KEYCLOAKIFY_GROUP_ID ??
                parsedPackageJson.keycloakify?.groupId ??
                (parsedPackageJson.homepage === undefined
                    ? fallbackGroupId
                    : urlParse(parsedPackageJson.homepage)
                          .host?.replace(/:[0-9]+$/, "")
                          ?.split(".")
                          .reverse()
                          .join(".") ?? fallbackGroupId) + ".keycloak"
            );
        })(),
        "artifactId": process.env.KEYCLOAKIFY_ARTIFACT_ID ?? parsedPackageJson.keycloakify?.artifactId ?? `${themeNames[0]}-keycloak-theme`,
        "doCreateJar": parsedPackageJson.keycloakify?.doCreateJar ?? true,
        "loginThemeResourcesFromKeycloakVersion": parsedPackageJson.keycloakify?.loginThemeResourcesFromKeycloakVersion ?? "11.0.3",
        reactAppRootDirPath,
        reactAppBuildDirPath,
        "keycloakifyBuildDirPath": (() => {
            if (parsedPackageJson.keycloakify?.keycloakifyBuildDirPath !== undefined) {
                return getAbsoluteAndInOsFormatPath({
                    "pathIsh": parsedPackageJson.keycloakify?.keycloakifyBuildDirPath,
                    "cwd": reactAppRootDirPath
                });
            }

            return resolvedViteConfig?.buildDir === undefined ? "build_keycloak" : `${resolvedViteConfig.buildDir}_keycloak`;
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
        cacheDirPath,
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
        "doBuildRetrocompatAccountTheme": parsedPackageJson.keycloakify?.doBuildRetrocompatAccountTheme ?? true
    };
}
