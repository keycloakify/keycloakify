import { join as pathJoin } from "path";
import * as fs from "fs";
import { crawl } from "./tools/crawl";
import { exclude } from "tsafe/exclude";

const reactProjectDirPath = process.cwd();

const themeSrcDirBasename = "keycloak-theme";

export function getThemeSrcDirPath() {
    const srcDirPath = pathJoin(reactProjectDirPath, "src");

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
