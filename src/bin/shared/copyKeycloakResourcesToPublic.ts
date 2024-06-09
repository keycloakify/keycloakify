import {
    downloadKeycloakStaticResources,
    type BuildContextLike as BuildContextLike_downloadKeycloakStaticResources
} from "./downloadKeycloakStaticResources";
import { join as pathJoin, relative as pathRelative } from "path";
import {
    themeTypes,
    keycloak_resources,
    lastKeycloakVersionWithAccountV1
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

    const destDirPath = pathJoin(buildContext.publicDirPath, keycloak_resources);

    const keycloakifyBuildinfoFilePath = pathJoin(destDirPath, "keycloakify.buildinfo");

    const keycloakifyBuildinfoRaw = JSON.stringify(
        {
            destDirPath,
            keycloakifyVersion: readThisNpmPackageVersion(),
            buildContext: {
                loginThemeResourcesFromKeycloakVersion: readThisNpmPackageVersion(),
                cacheDirPath: pathRelative(destDirPath, buildContext.cacheDirPath),
                npmWorkspaceRootDirPath: pathRelative(
                    destDirPath,
                    buildContext.npmWorkspaceRootDirPath
                )
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

    for (const themeType of themeTypes) {
        await downloadKeycloakStaticResources({
            keycloakVersion: (() => {
                switch (themeType) {
                    case "login":
                        return buildContext.loginThemeResourcesFromKeycloakVersion;
                    case "account":
                        return lastKeycloakVersionWithAccountV1;
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
