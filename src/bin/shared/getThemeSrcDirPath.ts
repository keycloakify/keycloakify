import * as fs from "fs";
import { exclude } from "tsafe";
import { crawl } from "../tools/crawl";
import { join as pathJoin } from "path";
import { themeTypes } from "./constants";
import chalk from "chalk";

let cache: { projectDirPath: string; themeSrcDirPath: string } | undefined = undefined;

/** Can't catch error, if the directory isn't found, this function will just exit the process with an error message. */
export function getThemeSrcDirPath(params: { projectDirPath: string }) {
    const { projectDirPath } = params;

    if (cache !== undefined && cache.projectDirPath === projectDirPath) {
        const { themeSrcDirPath } = cache;
        return { themeSrcDirPath };
    }

    cache = undefined;

    const { themeSrcDirPath } = (() => {
        const srcDirPath = pathJoin(projectDirPath, "src");

        const themeSrcDirPath: string | undefined = crawl({
            dirPath: srcDirPath,
            returnedPathsType: "relative to dirPath"
        })
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
            return { themeSrcDirPath: srcDirPath };
        }

        console.log(
            chalk.red("Can't locate your theme source directory. It should be either: ")
        );

        process.exit(-1);
    })();

    cache = { projectDirPath, themeSrcDirPath };

    return { themeSrcDirPath };
}

const themeSrcDirBasenames = ["keycloak-theme", "keycloak_theme"];
