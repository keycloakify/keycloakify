import { assert } from "tsafe/assert";
import { id } from "tsafe/id";
import { parse as urlParse } from "url";
import { typeGuard } from "tsafe/typeGuard";
import { symToStr } from "tsafe/symToStr";
import { bundlers, getParsedPackageJson, type Bundler } from "./parsedPackageJson";
import { join as pathJoin, sep as pathSep } from "path";
import parseArgv from "minimist";

/** Consolidated build option gathered form CLI arguments and config in package.json */
export type BuildOptions = {
    isSilent: boolean;
    themeVersion: string;
    themeName: string;
    extraThemeNames: string[];
    extraThemeProperties: string[] | undefined;
    groupId: string;
    artifactId: string;
    bundler: Bundler;
    keycloakVersionDefaultAssets: string;
    /** Directory of your built react project. Defaults to {cwd}/build */
    reactAppBuildDirPath: string;
    /** Directory that keycloakify outputs to. Defaults to {cwd}/build_keycloak */
    keycloakifyBuildDirPath: string;
    /** If your app is hosted under a subpath, it's the case in CRA if you have "homepage": "https://example.com/my-app" in your package.json
     * In this case the urlPathname will be "/my-app/" */
    urlPathname: string | undefined;
};

export function readBuildOptions(params: { projectDirPath: string; processArgv: string[] }): BuildOptions {
    const { projectDirPath, processArgv } = params;

    const { isSilentCliParamProvided } = (() => {
        const argv = parseArgv(processArgv);

        return {
            "isSilentCliParamProvided": typeof argv["silent"] === "boolean" ? argv["silent"] : false
        };
    })();

    const parsedPackageJson = getParsedPackageJson({ projectDirPath });

    const { name, keycloakify = {}, version, homepage } = parsedPackageJson;

    const { extraThemeProperties, groupId, artifactId, bundler, keycloakVersionDefaultAssets, extraThemeNames = [] } = keycloakify ?? {};

    const themeName =
        keycloakify.themeName ??
        name
            .replace(/^@(.*)/, "$1")
            .split("/")
            .join("-");

    return {
        themeName,
        extraThemeNames,
        "bundler": (() => {
            const { KEYCLOAKIFY_BUNDLER } = process.env;

            assert(
                typeGuard<Bundler | undefined>(KEYCLOAKIFY_BUNDLER, [undefined, ...id<readonly string[]>(bundlers)].includes(KEYCLOAKIFY_BUNDLER)),
                `${symToStr({ KEYCLOAKIFY_BUNDLER })} should be one of ${bundlers.join(", ")}`
            );

            return KEYCLOAKIFY_BUNDLER ?? bundler ?? "keycloakify";
        })(),
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
        "keycloakVersionDefaultAssets": keycloakVersionDefaultAssets ?? "11.0.3",
        "reactAppBuildDirPath": (() => {
            let { reactAppBuildDirPath = undefined } = parsedPackageJson.keycloakify ?? {};

            if (reactAppBuildDirPath === undefined) {
                return pathJoin(projectDirPath, "build");
            }

            if (pathSep === "\\") {
                reactAppBuildDirPath = reactAppBuildDirPath.replace(/\//g, pathSep);
            }

            if (reactAppBuildDirPath.startsWith(`.${pathSep}`)) {
                return pathJoin(projectDirPath, reactAppBuildDirPath);
            }

            return reactAppBuildDirPath;
        })(),
        "keycloakifyBuildDirPath": (() => {
            let { keycloakifyBuildDirPath = undefined } = parsedPackageJson.keycloakify ?? {};

            if (keycloakifyBuildDirPath === undefined) {
                return pathJoin(projectDirPath, "build_keycloak");
            }

            if (pathSep === "\\") {
                keycloakifyBuildDirPath = keycloakifyBuildDirPath.replace(/\//g, pathSep);
            }

            if (keycloakifyBuildDirPath.startsWith(`.${pathSep}`)) {
                return pathJoin(projectDirPath, keycloakifyBuildDirPath);
            }

            return keycloakifyBuildDirPath;
        })(),
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
