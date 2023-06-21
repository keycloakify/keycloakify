import * as fs from "fs";
import { exclude } from "tsafe";
import { crawl } from "./tools/crawl";
import { join as pathJoin } from "path";
import { themeTypes } from "./keycloakify/generateFtl";

const themeSrcDirBasename = "keycloak-theme";

/** Can't catch error, if the directory isn't found, this function will just exit the process with an error message. */
export function getThemeSrcDirPath(params: { projectDirPath: string }) {
    const { projectDirPath } = params;

    const srcDirPath = pathJoin(projectDirPath, "src");

    const themeSrcDirPath: string | undefined = crawl({ "dirPath": srcDirPath, "returnedPathsType": "relative to dirPath" })
        .map(fileRelativePath => {
            const split = fileRelativePath.split(themeSrcDirBasename);

            if (split.length !== 2) {
                return undefined;
            }

            return pathJoin(srcDirPath, split[0] + themeSrcDirBasename);
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
            "src/ or src/keycloak-theme.",
            "Example in the starter: https://github.com/keycloakify/keycloakify-starter/tree/main/src/keycloak-theme"
        ].join("\n")
    );

    process.exit(-1);
}
