import * as fs from "fs";
import { exclude } from "tsafe";
import { crawl } from "./tools/crawl";
import { join as pathJoin } from "path";

const themeSrcDirBasename = "keycloak-theme";

export function getThemeSrcDirPath(params: { projectDirPath: string }) {
    const { projectDirPath } = params;

    const srcDirPath = pathJoin(projectDirPath, "src");

    const themeSrcDirPath: string | undefined = crawl(srcDirPath)
        .map(fileRelativePath => {
            const split = fileRelativePath.split(themeSrcDirBasename);

            if (split.length !== 2) {
                return undefined;
            }

            return pathJoin(srcDirPath, split[0] + themeSrcDirBasename);
        })
        .filter(exclude(undefined))[0];

    if (themeSrcDirPath === undefined) {
        if (fs.existsSync(pathJoin(srcDirPath, "login")) || fs.existsSync(pathJoin(srcDirPath, "account"))) {
            return { "themeSrcDirPath": srcDirPath };
        }
        return { "themeSrcDirPath": undefined };
    }

    return { themeSrcDirPath };
}

export function getEmailThemeSrcDirPath(params: { projectDirPath: string }) {
    const { projectDirPath } = params;

    const { themeSrcDirPath } = getThemeSrcDirPath({ projectDirPath });

    const emailThemeSrcDirPath = themeSrcDirPath === undefined ? undefined : pathJoin(themeSrcDirPath, "email");

    return { emailThemeSrcDirPath };
}
