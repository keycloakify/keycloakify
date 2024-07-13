import {
    downloadKeycloakStaticResources,
    type BuildContextLike as BuildContextLike_downloadKeycloakStaticResources
} from "./downloadKeycloakStaticResources";
import { join as pathJoin, relative as pathRelative } from "path";
import {
    THEME_TYPES,
    KEYCLOAK_RESOURCES,
    LAST_KEYCLOAK_VERSION_WITH_ACCOUNT_V1
} from "../shared/constants";
import { readThisNpmPackageVersion } from "../tools/readThisNpmPackageVersion";
import { assert } from "tsafe/assert";
import * as fs from "fs";
import { rmSync } from "../tools/fs.rmSync";
import type { BuildContext } from "./buildContext";

export type BuildContextLike = BuildContextLike_downloadKeycloakStaticResources & {
    loginThemeResourcesFromKeycloakVersion: string;
    publicDirPath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export async function copyKeycloakResourcesToPublic(params: {
    buildContext: BuildContextLike;
}) {
    const { buildContext } = params;

    const destDirPath = pathJoin(buildContext.publicDirPath, KEYCLOAK_RESOURCES);

    const keycloakifyBuildinfoFilePath = pathJoin(destDirPath, "keycloakify.buildinfo");

    const keycloakifyBuildinfoRaw = JSON.stringify(
        {
            destDirPath,
            keycloakifyVersion: readThisNpmPackageVersion(),
            buildContext: {
                loginThemeResourcesFromKeycloakVersion: readThisNpmPackageVersion(),
                cacheDirPath: pathRelative(destDirPath, buildContext.cacheDirPath),
                fetchOptions: buildContext.fetchOptions
            }
        },
        null,
        2
    );

    skip_if_already_done: {
        if (!fs.existsSync(keycloakifyBuildinfoFilePath)) {
            break skip_if_already_done;
        }

        const keycloakifyBuildinfoRaw_previousRun = fs
            .readFileSync(keycloakifyBuildinfoFilePath)
            .toString("utf8");

        if (keycloakifyBuildinfoRaw_previousRun !== keycloakifyBuildinfoRaw) {
            break skip_if_already_done;
        }

        return;
    }

    rmSync(destDirPath, { force: true, recursive: true });

    fs.mkdirSync(destDirPath, { recursive: true });

    fs.writeFileSync(pathJoin(destDirPath, ".gitignore"), Buffer.from("*", "utf8"));

    for (const themeType of THEME_TYPES) {
        await downloadKeycloakStaticResources({
            keycloakVersion: (() => {
                switch (themeType) {
                    case "login":
                        return buildContext.loginThemeResourcesFromKeycloakVersion;
                    case "account":
                        return LAST_KEYCLOAK_VERSION_WITH_ACCOUNT_V1;
                }
            })(),
            themeType,
            themeDirPath: destDirPath,
            buildContext
        });
    }

    fs.writeFileSync(
        pathJoin(destDirPath, "README.txt"),
        Buffer.from(
            // prettier-ignore
            [
                "This is just a test folder that helps develop",
                "the login and register page without having to run a Keycloak container\n",
                "This directory will be automatically excluded from the final build."
            ].join(" ")
        )
    );

    fs.writeFileSync(
        keycloakifyBuildinfoFilePath,
        Buffer.from(keycloakifyBuildinfoRaw, "utf8")
    );
}
