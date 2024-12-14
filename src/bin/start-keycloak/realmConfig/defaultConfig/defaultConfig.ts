import { join as pathJoin, dirname as pathDirname } from "path";
import { getThisCodebaseRootDirPath } from "../../../tools/getThisCodebaseRootDirPath";
import * as fs from "fs";
import { exclude } from "tsafe/exclude";
import { assert } from "tsafe/assert";
import { type ParsedRealmJson, readRealmJsonFile } from "../ParsedRealmJson";

export function getDefaultRealmJsonFilePath(params: {
    keycloakMajorVersionNumber: number;
}) {
    const { keycloakMajorVersionNumber } = params;

    return pathJoin(
        getThisCodebaseRootDirPath(),
        "src",
        "bin",
        "start-keycloak",
        "realmConfig",
        "defaultConfig",
        `realm-kc-${keycloakMajorVersionNumber}.json`
    );
}

export const { getSupportedKeycloakMajorVersions } = (() => {
    let cache: number[] | undefined = undefined;

    function getSupportedKeycloakMajorVersions(): number[] {
        if (cache !== undefined) {
            return cache;
        }

        cache = fs
            .readdirSync(
                pathDirname(
                    getDefaultRealmJsonFilePath({ keycloakMajorVersionNumber: 0 })
                )
            )
            .map(fileBasename => {
                const match = fileBasename.match(/^realm-kc-(\d+)\.json$/);

                if (match === null) {
                    return undefined;
                }

                const n = parseInt(match[1]);

                assert(!isNaN(n));

                return n;
            })
            .filter(exclude(undefined))
            .sort((a, b) => b - a);

        return cache;
    }

    return { getSupportedKeycloakMajorVersions };
})();

export function getDefaultConfig(params: {
    keycloakMajorVersionNumber: number;
}): ParsedRealmJson {
    const { keycloakMajorVersionNumber } = params;

    assert(
        getSupportedKeycloakMajorVersions().includes(keycloakMajorVersionNumber),
        `We do not have a default config for Keycloak ${keycloakMajorVersionNumber}`
    );

    return readRealmJsonFile({
        realmJsonFilePath: getDefaultRealmJsonFilePath({
            keycloakMajorVersionNumber
        })
    });
}
