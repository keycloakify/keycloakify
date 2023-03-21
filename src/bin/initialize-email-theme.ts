#!/usr/bin/env node

import { downloadBuiltinKeycloakTheme } from "./download-builtin-keycloak-theme";
import { keycloakThemeEmailDirPath } from "./keycloakify";
import { join as pathJoin, relative as pathRelative } from "path";
import { transformCodebase } from "./tools/transformCodebase";
import { promptKeycloakVersion } from "./promptKeycloakVersion";
import * as fs from "fs";
import { getCliOptions } from "./tools/cliOptions";
import { getLogger } from "./tools/logger";

(async () => {
    const { isSilent } = getCliOptions(process.argv.slice(2));
    const logger = getLogger({ isSilent });

    if (fs.existsSync(keycloakThemeEmailDirPath)) {
        logger.warn(`There is already a ${pathRelative(process.cwd(), keycloakThemeEmailDirPath)} directory in your project. Aborting.`);

        process.exit(-1);
    }

    const { keycloakVersion } = await promptKeycloakVersion();

    const builtinKeycloakThemeTmpDirPath = pathJoin(keycloakThemeEmailDirPath, "..", "tmp_xIdP3_builtin_keycloak_theme");

    await downloadBuiltinKeycloakTheme({
        keycloakVersion,
        "destDirPath": builtinKeycloakThemeTmpDirPath,
        isSilent
    });

    transformCodebase({
        "srcDirPath": pathJoin(builtinKeycloakThemeTmpDirPath, "base", "email"),
        "destDirPath": keycloakThemeEmailDirPath
    });

    {
        const themePropertyFilePath = pathJoin(keycloakThemeEmailDirPath, "theme.properties");

        fs.writeFileSync(themePropertyFilePath, Buffer.from(`parent=base\n${fs.readFileSync(themePropertyFilePath).toString("utf8")}`, "utf8"));
    }

    logger.log(
        `${pathRelative(process.cwd(), keycloakThemeEmailDirPath)} ready to be customized, feel free to remove every file you do not customize`
    );

    fs.rmSync(builtinKeycloakThemeTmpDirPath, { "recursive": true, "force": true });
})();
