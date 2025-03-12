import { maybeDelegateCommandToCustomHandler } from "./shared/customHandler_delegate";
import { join as pathJoin, dirname as pathDirname } from "path";
import { WELL_KNOWN_DIRECTORY_BASE_NAME } from "./shared/constants";
import { readThisNpmPackageVersion } from "./tools/readThisNpmPackageVersion";
import * as fs from "fs";
import { rmSync } from "./tools/fs.rmSync";
import type { BuildContext } from "./shared/buildContext";
import { transformCodebase } from "./tools/transformCodebase";
import { getThisCodebaseRootDirPath } from "./tools/getThisCodebaseRootDirPath";

export async function command(params: { buildContext: BuildContext }) {
    const { buildContext } = params;

    const { hasBeenHandled } = await maybeDelegateCommandToCustomHandler({
        commandName: "copy-keycloak-resources-to-public",
        buildContext
    });

    if (hasBeenHandled) {
        return;
    }

    const destDirPath = pathJoin(
        buildContext.publicDirPath,
        WELL_KNOWN_DIRECTORY_BASE_NAME.KEYCLOAKIFY_DEV_RESOURCES
    );

    const keycloakifyBuildinfoFilePath = pathJoin(destDirPath, "keycloakify.buildinfo");

    const keycloakifyBuildinfoRaw = JSON.stringify(
        {
            keycloakifyVersion: readThisNpmPackageVersion()
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

    // NOTE: To remove in a while, remove the legacy keycloak-resources directory
    rmSync(pathJoin(pathDirname(destDirPath), "keycloak-resources"), {
        force: true,
        recursive: true
    });
    rmSync(pathJoin(pathDirname(destDirPath), ".keycloakify"), {
        force: true,
        recursive: true
    });

    fs.mkdirSync(destDirPath, { recursive: true });

    fs.writeFileSync(pathJoin(destDirPath, ".gitignore"), Buffer.from("*", "utf8"));

    transformCodebase({
        srcDirPath: pathJoin(
            getThisCodebaseRootDirPath(),
            "res",
            "public",
            WELL_KNOWN_DIRECTORY_BASE_NAME.KEYCLOAKIFY_DEV_RESOURCES
        ),
        destDirPath
    });

    fs.writeFileSync(
        pathJoin(destDirPath, "README.txt"),
        Buffer.from(
            // prettier-ignore
            [
                "This directory is only used in dev mode by Keycloakify",
                "It won't be included in your final build.",
                "Do not modify anything in this directory.",
            ].join("\n")
        )
    );

    fs.writeFileSync(
        keycloakifyBuildinfoFilePath,
        Buffer.from(keycloakifyBuildinfoRaw, "utf8")
    );
}
