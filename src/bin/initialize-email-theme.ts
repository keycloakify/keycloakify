#!/usr/bin/env node

import { downloadBuiltinKeycloakTheme } from "./download-builtin-keycloak-theme";
import { join as pathJoin, relative as pathRelative } from "path";
import { transformCodebase } from "./tools/transformCodebase";
import { promptKeycloakVersion } from "./promptKeycloakVersion";
import * as fs from "fs";
import { getCliOptions } from "./tools/cliOptions";
import { getLogger } from "./tools/logger";
import { crawl } from "./tools/crawl";
import { exclude } from "tsafe/exclude";

const reactProjectDirPath = process.cwd();

const themeSrcDirBasename = "keycloak-theme";

function getThemeSrcDirPath() {
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

    if (themeSrcDirBasename === undefined) {
        if (!fs.existsSync(pathJoin(srcDirPath, "kcContext.ts"))) {
            return { "themeSrcDirPath": undefined };
        }
        return { "themeSrcDirPath": srcDirPath };
    }

    return { themeSrcDirPath };
}

export function getEmailThemeSrcDirPath() {
    const { themeSrcDirPath } = getThemeSrcDirPath();

    const emailThemeSrcDirPath = themeSrcDirPath === undefined ? undefined : pathJoin(themeSrcDirPath, "email");

    return { emailThemeSrcDirPath };
}

async function main() {
    const { isSilent } = getCliOptions(process.argv.slice(2));
    const logger = getLogger({ isSilent });

    const { emailThemeSrcDirPath } = getEmailThemeSrcDirPath();

    if (emailThemeSrcDirPath === undefined) {
        logger.warn(`Couldn't locate you ${themeSrcDirBasename} directory`);

        process.exit(-1);
    }

    if (fs.existsSync(emailThemeSrcDirPath)) {
        logger.warn(`There is already a ${pathRelative(process.cwd(), emailThemeSrcDirPath)} directory in your project. Aborting.`);

        process.exit(-1);
    }

    const { keycloakVersion } = await promptKeycloakVersion();

    const builtinKeycloakThemeTmpDirPath = pathJoin(emailThemeSrcDirPath, "..", "tmp_xIdP3_builtin_keycloak_theme");

    await downloadBuiltinKeycloakTheme({
        keycloakVersion,
        "destDirPath": builtinKeycloakThemeTmpDirPath,
        isSilent
    });

    transformCodebase({
        "srcDirPath": pathJoin(builtinKeycloakThemeTmpDirPath, "base", "email"),
        "destDirPath": emailThemeSrcDirPath
    });

    {
        const themePropertyFilePath = pathJoin(emailThemeSrcDirPath, "theme.properties");

        fs.writeFileSync(themePropertyFilePath, Buffer.from(`parent=base\n${fs.readFileSync(themePropertyFilePath).toString("utf8")}`, "utf8"));
    }

    logger.log(`${pathRelative(process.cwd(), emailThemeSrcDirPath)} ready to be customized, feel free to remove every file you do not customize`);

    fs.rmSync(builtinKeycloakThemeTmpDirPath, { "recursive": true, "force": true });
}

if (require.main === module) {
    main();
}
