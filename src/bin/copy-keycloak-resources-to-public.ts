#!/usr/bin/env node

import { downloadKeycloakStaticResources, type BuildOptionsLike } from "./keycloakify/generateTheme/downloadKeycloakStaticResources";
import { join as pathJoin, relative as pathRelative } from "path";
import { readBuildOptions } from "./keycloakify/buildOptions";
import { themeTypes, keycloak_resources, lastKeycloakVersionWithAccountV1 } from "./constants";
import { readThisNpmProjectVersion } from "./tools/readThisNpmProjectVersion";
import { assert, type Equals } from "tsafe/assert";
import * as fs from "fs";
import { rmSync } from "./tools/fs.rmSync";

export async function copyKeycloakResourcesToPublic(params: { processArgv: string[] }) {
    const { processArgv } = params;

    const buildOptions = readBuildOptions({ processArgv });

    const destDirPath = pathJoin(buildOptions.publicDirPath, keycloak_resources);

    const keycloakifyBuildinfoFilePath = pathJoin(destDirPath, "keycloakify.buildinfo");

    const { keycloakifyBuildinfoRaw } = generateKeycloakifyBuildinfoRaw({
        destDirPath,
        "keycloakifyVersion": readThisNpmProjectVersion(),
        buildOptions
    });

    skip_if_already_done: {
        if (!fs.existsSync(keycloakifyBuildinfoFilePath)) {
            break skip_if_already_done;
        }

        const keycloakifyBuildinfoRaw_previousRun = fs.readFileSync(keycloakifyBuildinfoFilePath).toString("utf8");

        if (keycloakifyBuildinfoRaw_previousRun !== keycloakifyBuildinfoRaw) {
            break skip_if_already_done;
        }

        return;
    }

    rmSync(destDirPath, { "force": true, "recursive": true });

    for (const themeType of themeTypes) {
        await downloadKeycloakStaticResources({
            "keycloakVersion": (() => {
                switch (themeType) {
                    case "login":
                        return buildOptions.loginThemeResourcesFromKeycloakVersion;
                    case "account":
                        return lastKeycloakVersionWithAccountV1;
                }
            })(),
            themeType,
            "themeDirPath": destDirPath,
            buildOptions
        });
    }

    fs.writeFileSync(
        pathJoin(destDirPath, "README.txt"),
        Buffer.from(
            // prettier-ignore
            [
                "This is just a test folder that helps develop",
                "the login and register page without having to run a Keycloak container"
            ].join(" ")
        )
    );

    fs.writeFileSync(pathJoin(buildOptions.publicDirPath, keycloak_resources, ".gitignore"), Buffer.from("*", "utf8"));

    fs.writeFileSync(keycloakifyBuildinfoFilePath, Buffer.from(keycloakifyBuildinfoRaw, "utf8"));
}

export function generateKeycloakifyBuildinfoRaw(params: {
    destDirPath: string;
    keycloakifyVersion: string;
    buildOptions: BuildOptionsLike & {
        loginThemeResourcesFromKeycloakVersion: string;
    };
}) {
    const { destDirPath, keycloakifyVersion, buildOptions } = params;

    const { cacheDirPath, npmWorkspaceRootDirPath, loginThemeResourcesFromKeycloakVersion, ...rest } = buildOptions;

    assert<Equals<typeof rest, {}>>(true);

    const keycloakifyBuildinfoRaw = JSON.stringify(
        {
            keycloakifyVersion,
            "buildOptions": {
                loginThemeResourcesFromKeycloakVersion,
                "cacheDirPath": pathRelative(destDirPath, cacheDirPath),
                "npmWorkspaceRootDirPath": pathRelative(destDirPath, npmWorkspaceRootDirPath)
            }
        },
        null,
        2
    );

    return { keycloakifyBuildinfoRaw };
}

async function main() {
    await copyKeycloakResourcesToPublic({
        "processArgv": process.argv.slice(2)
    });
}

if (require.main === module) {
    main();
}
