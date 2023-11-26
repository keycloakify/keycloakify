import * as fs from "fs";
import { exclude } from "tsafe";
import { crawl } from "./tools/crawl";
import { join as pathJoin } from "path";
import { themeTypes } from "./constants";

const themeSrcDirBasenames = ["keycloak-theme", "keycloak_theme"];

/** Can't catch error, if the directory isn't found, this function will just exit the process with an error message. */
export function getThemeSrcDirPath(params: { reactAppRootDirPath: string }) {
    const { reactAppRootDirPath } = params;

    const srcDirPath = pathJoin(reactAppRootDirPath, "src");

    const themeSrcDirPath: string | undefined = crawl({ "dirPath": srcDirPath, "returnedPathsType": "relative to dirPath" })
        .map(fileRelativePath => {
            for (const themeSrcDirBasename of themeSrcDirBasenames) {
                const split = fileRelativePath.split(themeSrcDirBasename);
                if (split.length === 2) {
                    return pathJoin(srcDirPath, split[0] + themeSrcDirBasename);
                }
            }
            return undefined;
        })
        .filter(exclude(undefined))[0];

    if (themeSrcDirPath !== undefined) {
        return { themeSrcDirPath };
    }

    for (const themeType of [...themeTypes, "email"]) {
        if (!fs.existsSync(pathJoin(srcDirPath, themeType))) {
            continue;
        }
        return { "themeSrcDirPath": srcDirPath };
    }

    console.error(
        [
            "Can't locate your theme source directory. It should be either: ",
            "src/ or src/keycloak-theme or src/keycloak_theme.",
            "Example in the starter: https://github.com/keycloakify/keycloakify-starter/tree/main/src/keycloak-theme"
        ].join("\n")
    );

    process.exit(-1);
}
