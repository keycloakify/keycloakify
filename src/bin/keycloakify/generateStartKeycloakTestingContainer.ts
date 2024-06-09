import * as fs from "fs";
import {
    join as pathJoin,
    relative as pathRelative,
    basename as pathBasename
} from "path";
import { assert } from "tsafe/assert";
import type { BuildContext } from "../shared/buildContext";
import { accountV1ThemeName } from "../shared/constants";

export type BuildContextLike = {
    keycloakifyBuildDirPath: string;
    themeNames: string[];
};

assert<BuildContext extends BuildContextLike ? true : false>();

generateStartKeycloakTestingContainer.basename = "start_keycloak_testing_container.sh";

const containerName = "keycloak-testing-container";
const keycloakVersion = "24.0.4";

/** Files for being able to run a hot reload keycloak container */
export function generateStartKeycloakTestingContainer(params: {
    jarFilePath: string;
    doesImplementAccountTheme: boolean;
    buildContext: BuildContextLike;
}) {
    const { jarFilePath, doesImplementAccountTheme, buildContext } = params;

    const themeRelativeDirPath = pathJoin("src", "main", "resources", "theme");

    fs.writeFileSync(
        pathJoin(
            buildContext.keycloakifyBuildDirPath,
            generateStartKeycloakTestingContainer.basename
        ),
        Buffer.from(
            [
                "#!/usr/bin/env bash",
                "",
                `docker rm ${containerName} || true`,
                "",
                `cd "${buildContext.keycloakifyBuildDirPath}"`,
                "",
                "docker run \\",
                "   -p 8080:8080 \\",
                `   --name ${containerName} \\`,
                "   -e KEYCLOAK_ADMIN=admin \\",
                "   -e KEYCLOAK_ADMIN_PASSWORD=admin \\",
                `   -v "${pathJoin(
                    "$(pwd)",
                    pathRelative(buildContext.keycloakifyBuildDirPath, jarFilePath)
                )}":"/opt/keycloak/providers/${pathBasename(jarFilePath)}" \\`,
                [
                    ...(doesImplementAccountTheme ? [accountV1ThemeName] : []),
                    ...buildContext.themeNames
                ].map(
                    themeName =>
                        `   -v "${pathJoin(
                            "$(pwd)",
                            themeRelativeDirPath,
                            themeName
                        ).replace(/\\/g, "/")}":"/opt/keycloak/themes/${themeName}":rw \\`
                ),
                `   -it quay.io/keycloak/keycloak:${keycloakVersion} \\`,
                `   start-dev`,
                ""
            ].join("\n"),
            "utf8"
        ),
        { mode: 0o755 }
    );
}
