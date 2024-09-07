import { join as pathJoin } from "path";
import { downloadKeycloakDefaultTheme } from "./downloadKeycloakDefaultTheme";
import { KEYCLOAK_VERSION } from "./constants";
import { transformCodebase } from "../../src/bin/tools/transformCodebase";
import { existsAsync } from "../../src/bin/tools/fs.existsAsync";
import { getThisCodebaseRootDirPath } from "../../src/bin/tools/getThisCodebaseRootDirPath";
import { WELL_KNOWN_DIRECTORY_BASE_NAME } from "../../src/bin/shared/constants";
import { assert, type Equals } from "tsafe/assert";

export async function createResourcesDir() {
    await Promise.all(
        (["login", "account"] as const).map(async themeType => {
            const keycloakVersion = (() => {
                switch (themeType) {
                    case "login":
                        return KEYCLOAK_VERSION.FOR_LOGIN_THEME;
                    case "account":
                        return KEYCLOAK_VERSION.FOR_ACCOUNT_MULTI_PAGE;
                }
                assert<Equals<typeof themeType, never>>();
            })();

            const { extractedDirPath } = await downloadKeycloakDefaultTheme({
                keycloakVersion
            });

            const destDirPath = pathJoin(
                getThisCodebaseRootDirPath(),
                WELL_KNOWN_DIRECTORY_BASE_NAME.RESOURCES,
                themeType
            );

            base_resources: {
                const srcDirPath = pathJoin(
                    extractedDirPath,
                    "base",
                    themeType,
                    "resources"
                );

                if (!(await existsAsync(srcDirPath))) {
                    break base_resources;
                }

                transformCodebase({
                    srcDirPath,
                    destDirPath
                });
            }

            transformCodebase({
                srcDirPath: pathJoin(
                    extractedDirPath,
                    "keycloak",
                    themeType,
                    "resources"
                ),
                destDirPath
            });

            transformCodebase({
                srcDirPath: pathJoin(extractedDirPath, "keycloak", "common", "resources"),
                destDirPath: pathJoin(
                    destDirPath,
                    WELL_KNOWN_DIRECTORY_BASE_NAME.RESOURCES_COMMON
                )
            });
        })
    );
}
