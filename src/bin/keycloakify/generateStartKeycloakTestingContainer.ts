import * as fs from "fs";
import { join as pathJoin, relative as pathRelative, basename as pathBasename } from "path";
import { assert } from "tsafe/assert";
import type { BuildOptions } from "../shared/buildOptions";
import { accountV1ThemeName } from "../shared/constants";

export type BuildOptionsLike = {
    keycloakifyBuildDirPath: string;
    themeNames: string[];
};

assert<BuildOptions extends BuildOptionsLike ? true : false>();

generateStartKeycloakTestingContainer.basename = "start_keycloak_testing_container.sh";

const containerName = "keycloak-testing-container";
const keycloakVersion = "24.0.4";

/** Files for being able to run a hot reload keycloak container */
export function generateStartKeycloakTestingContainer(params: {
    jarFilePath: string;
    doesImplementAccountTheme: boolean;
    buildOptions: BuildOptionsLike;
}) {
    const { jarFilePath, doesImplementAccountTheme, buildOptions } = params;

    const themeRelativeDirPath = pathJoin("src", "main", "resources", "theme");

    fs.writeFileSync(
        pathJoin(buildOptions.keycloakifyBuildDirPath, generateStartKeycloakTestingContainer.basename),
        Buffer.from(
            [
                "#!/usr/bin/env bash",
                "",
                `docker rm ${containerName} || true`,
                "",
                `cd "${buildOptions.keycloakifyBuildDirPath}"`,
                "",
                "docker run \\",
                "   -p 8080:8080 \\",
                `   --name ${containerName} \\`,
                "   -e KEYCLOAK_ADMIN=admin \\",
                "   -e KEYCLOAK_ADMIN_PASSWORD=admin \\",
                `   -v "${pathJoin(
                    "$(pwd)",
                    pathRelative(buildOptions.keycloakifyBuildDirPath, jarFilePath)
                )}":"/opt/keycloak/providers/${pathBasename(jarFilePath)}" \\`,
                [...(doesImplementAccountTheme ? [accountV1ThemeName] : []), ...buildOptions.themeNames].map(
                    themeName =>
                        `   -v "${pathJoin("$(pwd)", themeRelativeDirPath, themeName).replace(/\\/g, "/")}":"/opt/keycloak/themes/${themeName}":rw \\`
                ),
                `   -it quay.io/keycloak/keycloak:${keycloakVersion} \\`,
                `   start-dev`,
                ""
            ].join("\n"),
            "utf8"
        ),
        { "mode": 0o755 }
    );
}
