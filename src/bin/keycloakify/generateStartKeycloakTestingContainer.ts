import * as fs from "fs";
import { join as pathJoin } from "path";
import { assert } from "tsafe/assert";
import { Reflect } from "tsafe/Reflect";
import type { BuildOptions } from "./BuildOptions";

export type BuildOptionsLike = {
    themeName: string;
};

{
    const buildOptions = Reflect<BuildOptions>();

    assert<typeof buildOptions extends BuildOptionsLike ? true : false>();
}

generateStartKeycloakTestingContainer.basename = "start_keycloak_testing_container.sh";

const containerName = "keycloak-testing-container";

/** Files for being able to run a hot reload keycloak container */
export function generateStartKeycloakTestingContainer(params: {
    keycloakVersion: string;
    keycloakThemeBuildingDirPath: string;
    buildOptions: BuildOptionsLike;
}) {
    const {
        keycloakThemeBuildingDirPath,
        keycloakVersion,
        buildOptions: { themeName }
    } = params;

    const keycloakThemePath = pathJoin(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme", themeName).replace(/\\/g, "/");

    fs.writeFileSync(
        pathJoin(keycloakThemeBuildingDirPath, generateStartKeycloakTestingContainer.basename),

        Buffer.from(
            [
                "#!/usr/bin/env bash",
                "",
                `docker rm ${containerName} || true`,
                "",
                `cd "${keycloakThemeBuildingDirPath.replace(/\\/g, "/")}"`,
                "",
                "docker run \\",
                "   -p 8080:8080 \\",
                `   --name ${containerName} \\`,
                "   -e KEYCLOAK_ADMIN=admin \\",
                "   -e KEYCLOAK_ADMIN_PASSWORD=admin \\",
                "   -e JAVA_OPTS=-Dkeycloak.profile=preview \\",
                `   -v "${keycloakThemePath}":"/opt/keycloak/themes/${themeName}":rw \\`,
                `   -it quay.io/keycloak/keycloak:${keycloakVersion} \\`,
                `   start-dev`,
                ""
            ].join("\n"),
            "utf8"
        ),
        { "mode": 0o755 }
    );
}
