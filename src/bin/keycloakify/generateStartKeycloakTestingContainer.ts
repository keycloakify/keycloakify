import * as fs from "fs";
import { join as pathJoin, relative as pathRelative, basename as pathBasename } from "path";
import { assert } from "tsafe/assert";
import { Reflect } from "tsafe/Reflect";
import type { BuildOptions } from "./buildOptions";

export type BuildOptionsLike = {
    keycloakifyBuildDirPath: string;
};

{
    const buildOptions = Reflect<BuildOptions>();

    assert<typeof buildOptions extends BuildOptionsLike ? true : false>();
}

generateStartKeycloakTestingContainer.basename = "start_keycloak_testing_container.sh";

const containerName = "keycloak-testing-container";

/** Files for being able to run a hot reload keycloak container */
export function generateStartKeycloakTestingContainer(params: { jarFilePath: string; keycloakVersion: string; buildOptions: BuildOptionsLike }) {
    const { jarFilePath, keycloakVersion, buildOptions } = params;

    const themeRelativeDirPath = pathJoin("src", "main", "resources", "theme");
    const themeDirPath = pathJoin(buildOptions.keycloakifyBuildDirPath, themeRelativeDirPath);

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
                ...fs
                    .readdirSync(themeDirPath)
                    .filter(name => fs.lstatSync(pathJoin(themeDirPath, name)).isDirectory())
                    .map(
                        themeName =>
                            `   -v "${pathJoin("$(pwd)", themeRelativeDirPath, themeName).replace(
                                /\\/g,
                                "/"
                            )}":"/opt/keycloak/themes/${themeName}":rw \\`
                    ),
                `   -it quay.io/keycloak/keycloak:${keycloakVersion} \\`,
                `   start-dev --features=declarative-user-profile`,
                ""
            ].join("\n"),
            "utf8"
        ),
        { "mode": 0o755 }
    );
}
