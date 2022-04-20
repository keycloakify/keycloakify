#!/usr/bin/env node

import { downloadBuiltinKeycloakTheme } from "./download-builtin-keycloak-theme";
import { keycloakThemeEmailDirPath } from "./build-keycloak-theme";
import { join as pathJoin, basename as pathBasename } from "path";
import { transformCodebase } from "./tools/transformCodebase";
import { promptKeycloakVersion } from "./promptKeycloakVersion";
import * as fs from "fs";

if (require.main === module) {
    (async () => {
        if (fs.existsSync(keycloakThemeEmailDirPath)) {
            console.log(`There is already a ./${pathBasename(keycloakThemeEmailDirPath)} directory in your project. Aborting.`);

            process.exit(-1);
        }

        const { keycloakVersion } = await promptKeycloakVersion();

        const builtinKeycloakThemeTmpDirPath = pathJoin(keycloakThemeEmailDirPath, "..", "tmp_xIdP3_builtin_keycloak_theme");

        downloadBuiltinKeycloakTheme({
            keycloakVersion,
            "destDirPath": builtinKeycloakThemeTmpDirPath,
        });

        transformCodebase({
            "srcDirPath": pathJoin(builtinKeycloakThemeTmpDirPath, "base", "email"),
            "destDirPath": keycloakThemeEmailDirPath,
        });

        console.log(`./${pathBasename(keycloakThemeEmailDirPath)} ready to be customized`);

        fs.rmSync(builtinKeycloakThemeTmpDirPath, { "recursive": true, "force": true });
    })();
}
