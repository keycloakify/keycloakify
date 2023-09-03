#!/usr/bin/env node

import { downloadKeycloakStaticResources } from "./keycloakify/generateTheme/downloadKeycloakStaticResources";
import { join as pathJoin, relative as pathRelative, isAbsolute as pathIsAbsolute } from "path";
import { readBuildOptions } from "./keycloakify/BuildOptions";
import { themeTypes, keycloak_resources, lastKeycloakVersionWithAccountV1 } from "./constants";
import * as fs from "fs";

(async () => {
    const cwd = process.cwd();

    const projectDirPath = cwd;

    const publicDirPath = (() => {
        from_env_var: {
            const value = process.env["PUBLIC_DIR_PATH"];

            if (value === undefined) {
                break from_env_var;
            }

            return pathIsAbsolute(value) ? value : pathJoin(cwd, value);
        }

        return pathJoin(projectDirPath, "public");
    })();

    const buildOptions = readBuildOptions({
        "processArgv": process.argv.slice(2),
        "projectDirPath": process.cwd()
    });

    const reservedDirPath = pathJoin(publicDirPath, keycloak_resources);

    for (const themeType of themeTypes) {
        await downloadKeycloakStaticResources({
            projectDirPath,
            "keycloakVersion": (() => {
                switch (themeType) {
                    case "login":
                        return buildOptions.loginThemeResourcesFromKeycloakVersion;
                    case "account":
                        return lastKeycloakVersionWithAccountV1;
                }
            })(),
            themeType,
            "themeDirPath": reservedDirPath,
            "usedResources": undefined
        });
    }

    fs.writeFileSync(
        pathJoin(reservedDirPath, "README.txt"),
        Buffer.from(
            // prettier-ignore
            [
                "This is just a test folder that helps develop",
                "the login and register page without having to run a Keycloak container"
            ].join(" ")
        )
    );

    fs.writeFileSync(pathJoin(publicDirPath, "keycloak-resources", ".gitignore"), Buffer.from("*", "utf8"));

    console.log(`${pathRelative(projectDirPath, reservedDirPath)} directory created.`);
})();
