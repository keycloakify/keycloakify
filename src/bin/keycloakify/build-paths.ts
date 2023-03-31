import * as fs from "fs";
import { exclude } from "tsafe";
import { crawl } from "../tools/crawl";
import { pathJoin } from "../tools/pathJoin";
import { getParsedPackageJson } from "./parsed-package-json";

const DEFAULT_APP_INPUT_PATH = "build";

const DEFAULT_KEYCLOAK_BUILD_PATH = "build_keycloak";

const THEME_SRC_DIR_BASENAME = "keycloak-theme";

export const getReactProjectDirPath = () => process.cwd();

export const getCnamePath = () => pathJoin(getReactProjectDirPath(), "public", "CNAME");

const parseAppInputPath = (path?: string) => {
    if (!path) {
        return pathJoin(process.cwd(), DEFAULT_APP_INPUT_PATH);
    } else if (path.startsWith("./")) {
        return pathJoin(process.cwd(), path.replace("./", ""));
    }
    return path;
};

const parseKeycloakBuildPath = (path?: string) => {
    if (!path) {
        return pathJoin(process.cwd(), DEFAULT_KEYCLOAK_BUILD_PATH);
    } else if (path.startsWith("./")) {
        return pathJoin(process.cwd(), path.replace("./", ""));
    }
    return path;
};

export const getAppInputPath = () => {
    return parseAppInputPath(getParsedPackageJson().keycloakify?.appInputPath);
};

export const getKeycloakBuildPath = () => {
    return parseKeycloakBuildPath(getParsedPackageJson().keycloakify?.keycloakBuildPath);
};
export const getThemeSrcDirPath = () => {
    const srcDirPath = pathJoin(getReactProjectDirPath(), "src");

    const themeSrcDirPath: string | undefined = crawl(srcDirPath)
        .map(fileRelativePath => {
            const split = fileRelativePath.split(THEME_SRC_DIR_BASENAME);

            if (split.length !== 2) {
                return undefined;
            }

            return pathJoin(srcDirPath, split[0] + THEME_SRC_DIR_BASENAME);
        })
        .filter(exclude(undefined))[0];
    if (themeSrcDirPath === undefined) {
        if (fs.existsSync(pathJoin(srcDirPath, "login")) || fs.existsSync(pathJoin(srcDirPath, "account"))) {
            return { "themeSrcDirPath": srcDirPath };
        }
        return { "themeSrcDirPath": undefined };
    }

    return { themeSrcDirPath };
};

export const getEmailThemeSrcDirPath = () => {
    const { themeSrcDirPath } = getThemeSrcDirPath();

    const emailThemeSrcDirPath = themeSrcDirPath === undefined ? undefined : pathJoin(themeSrcDirPath, "email");

    return { emailThemeSrcDirPath };
};
