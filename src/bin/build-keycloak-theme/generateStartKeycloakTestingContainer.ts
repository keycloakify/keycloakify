import * as fs from "fs";
import { join as pathJoin } from "path";

generateStartKeycloakTestingContainer.basename = "start_keycloak_testing_container.sh";

const containerName = "keycloak-testing-container";

/** Files for being able to run a hot reload keycloak container */
export function generateStartKeycloakTestingContainer(params: { keycloakVersion: string; themeName: string; keycloakThemeBuildingDirPath: string }) {
    const { themeName, keycloakThemeBuildingDirPath, keycloakVersion } = params;

    fs.writeFileSync(
        pathJoin(keycloakThemeBuildingDirPath, generateStartKeycloakTestingContainer.basename),
        Buffer.from(
            [
                "#!/bin/bash",
                "",
                `docker rm ${containerName} || true`,
                "",
                `cd ${keycloakThemeBuildingDirPath}`,
                "",
                "docker run \\",
                "   -p 8080:8080 \\",
                `   --name ${containerName} \\`,
                "   -e KEYCLOAK_ADMIN=admin \\",
                "   -e KEYCLOAK_ADMIN_PASSWORD=admin \\",
                "   -e JAVA_OPTS=-Dkeycloak.profile=preview \\",
                `   -v ${pathJoin(
                    keycloakThemeBuildingDirPath,
                    "src",
                    "main",
                    "resources",
                    "theme",
                    themeName,
                )}:/opt/keycloak/themes/${themeName}:rw \\`,
                `   -it quay.io/keycloak/keycloak:${keycloakVersion} \\`,
                `   start-dev`,
                "",
            ].join("\n"),
            "utf8",
        ),
        { "mode": 0o755 },
    );
}
