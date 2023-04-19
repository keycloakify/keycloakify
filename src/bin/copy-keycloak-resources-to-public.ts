#!/usr/bin/env node

import { downloadKeycloakStaticResources } from "./keycloakify/generateTheme/downloadKeycloakStaticResources";
import { join as pathJoin, relative as pathRelative } from "path";
import { basenameOfKeycloakDirInPublicDir } from "./mockTestingResourcesPath";
import { readBuildOptions } from "./keycloakify/BuildOptions";
import { themeTypes } from "./keycloakify/generateFtl";
import * as fs from "fs";

(async () => {
    const projectDirPath = process.cwd();

    const buildOptions = readBuildOptions({
        "processArgv": process.argv.slice(2),
        "projectDirPath": process.cwd()
    });

    const keycloakDirInPublicDir = pathJoin(process.env["PUBLIC_DIR_PATH"] || pathJoin(projectDirPath, "public"), basenameOfKeycloakDirInPublicDir);

    if (fs.existsSync(keycloakDirInPublicDir)) {
        console.log(`${pathRelative(projectDirPath, keycloakDirInPublicDir)} already exists.`);
        return;
    }

    for (const themeType of themeTypes) {
        await downloadKeycloakStaticResources({
            "isSilent": false,
            "keycloakVersion": buildOptions.keycloakVersionDefaultAssets,
            "themeType": themeType,
            "themeDirPath": keycloakDirInPublicDir
        });
    }

    fs.writeFileSync(
        pathJoin(keycloakDirInPublicDir, "README.txt"),
        Buffer.from(
            // prettier-ignore
            [
                "This is just a test folder that helps develop",
                "the login and register page without having to run a Keycloak container"
            ].join(" ")
        )
    );

    fs.writeFileSync(pathJoin(keycloakDirInPublicDir, ".gitignore"), Buffer.from("*", "utf8"));

    console.log(`${pathRelative(projectDirPath, keycloakDirInPublicDir)} directory created.`);
})();
