import { parse as urlParse } from "url";
import { getParsedPackageJson } from "./parsedPackageJson";
import { join as pathJoin } from "path";
import parseArgv from "minimist";
import { getAbsoluteAndInOsFormatPath } from "../tools/getAbsoluteAndInOsFormatPath";

/** Consolidated build option gathered form CLI arguments and config in package.json */
export type BuildOptions = {
    isSilent: boolean;
    themeVersion: string;
    themeName: string;
    extraThemeNames: string[];
    extraThemeProperties: string[] | undefined;
    groupId: string;
    artifactId: string;
    doCreateJar: boolean;
    loginThemeResourcesFromKeycloakVersion: string;
    reactAppRootDirPath: string;
    /** Directory of your built react project. Defaults to {cwd}/build */
    reactAppBuildDirPath: string;
    /** Directory that keycloakify outputs to. Defaults to {cwd}/build_keycloak */
    keycloakifyBuildDirPath: string;
    publicDirPath: string;
    cacheDirPath: string;
    /** If your app is hosted under a subpath, it's the case in CRA if you have "homepage": "https://example.com/my-app" in your package.json
     * In this case the urlPathname will be "/my-app/" */
    urlPathname: string | undefined;
};

export function readBuildOptions(params: { reactAppRootDirPath: string; processArgv: string[] }): BuildOptions {
    const { reactAppRootDirPath, processArgv } = params;

    const { isSilentCliParamProvided } = (() => {
        const argv = parseArgv(processArgv);

        return {
            "isSilentCliParamProvided": typeof argv["silent"] === "boolean" ? argv["silent"] : false
        };
    })();

    const parsedPackageJson = getParsedPackageJson({ reactAppRootDirPath });

    const { name, keycloakify = {}, version, homepage } = parsedPackageJson;

    const {
        extraThemeProperties,
        groupId,
        artifactId,
        doCreateJar,
        loginThemeResourcesFromKeycloakVersion,
        extraThemeNames = []
    } = keycloakify ?? {};

    const themeName =
        keycloakify.themeName ??
        name
            .replace(/^@(.*)/, "$1")
            .split("/")
            .join("-");

    return {
        reactAppRootDirPath,
        themeName,
        extraThemeNames,
        "doCreateJar": doCreateJar ?? true,
        "artifactId": process.env.KEYCLOAKIFY_ARTIFACT_ID ?? artifactId ?? `${themeName}-keycloak-theme`,
        "groupId": (() => {
            const fallbackGroupId = `${themeName}.keycloak`;

            return (
                process.env.KEYCLOAKIFY_GROUP_ID ??
                groupId ??
                (!homepage
                    ? fallbackGroupId
                    : urlParse(homepage)
                          .host?.replace(/:[0-9]+$/, "")
                          ?.split(".")
                          .reverse()
                          .join(".") ?? fallbackGroupId) + ".keycloak"
            );
        })(),
        "themeVersion": process.env.KEYCLOAKIFY_THEME_VERSION ?? process.env.KEYCLOAKIFY_VERSION ?? version ?? "0.0.0",
        extraThemeProperties,
        "isSilent": isSilentCliParamProvided,
        "loginThemeResourcesFromKeycloakVersion": loginThemeResourcesFromKeycloakVersion ?? "11.0.3",
        "publicDirPath": (() => {
            let { PUBLIC_DIR_PATH } = process.env;

            if (PUBLIC_DIR_PATH !== undefined) {
                return getAbsoluteAndInOsFormatPath({
                    "pathIsh": PUBLIC_DIR_PATH,
                    "cwd": reactAppRootDirPath
                });
            }

            return pathJoin(reactAppRootDirPath, "public");
        })(),
        "reactAppBuildDirPath": (() => {
            const { reactAppBuildDirPath } = parsedPackageJson.keycloakify ?? {};

            if (reactAppBuildDirPath !== undefined) {
                return getAbsoluteAndInOsFormatPath({
                    "pathIsh": reactAppBuildDirPath,
                    "cwd": reactAppRootDirPath
                });
            }

            return pathJoin(reactAppRootDirPath, "build");
        })(),
        "keycloakifyBuildDirPath": (() => {
            const { keycloakifyBuildDirPath } = parsedPackageJson.keycloakify ?? {};

            if (keycloakifyBuildDirPath !== undefined) {
                return getAbsoluteAndInOsFormatPath({
                    "pathIsh": keycloakifyBuildDirPath,
                    "cwd": reactAppRootDirPath
                });
            }

            return pathJoin(reactAppRootDirPath, "build_keycloak");
        })(),
        "cacheDirPath": pathJoin(
            (() => {
                let { XDG_CACHE_HOME } = process.env;

                if (XDG_CACHE_HOME !== undefined) {
                    return getAbsoluteAndInOsFormatPath({
                        "pathIsh": XDG_CACHE_HOME,
                        "cwd": reactAppRootDirPath
                    });
                }

                return pathJoin(reactAppRootDirPath, "node_modules", ".cache");
            })(),
            "keycloakify"
        ),
        "urlPathname": (() => {
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
        })()
    };
}
