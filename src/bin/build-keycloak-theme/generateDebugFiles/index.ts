
import * as fs from "fs";
import { join as pathJoin, dirname as pathDirname, basename as pathBasename } from "path";

/** Files for being able to run a hot reload keycloak container */
export function generateDebugFiles(
    params: {
        packageJsonName: string;
        keycloakThemeBuildingDirPath: string;
    }
) {

    const { packageJsonName, keycloakThemeBuildingDirPath } = params;

    fs.writeFileSync(
        pathJoin(keycloakThemeBuildingDirPath, "Dockerfile"),
        Buffer.from(
            [
                "FROM jboss/keycloak:11.0.3",
                "",
                "USER root",
                "",
                "WORKDIR /",
                "",
                "ADD configuration /opt/jboss/keycloak/standalone/configuration/",
                "",
                'ENTRYPOINT [ "/opt/jboss/tools/docker-entrypoint.sh" ]',
            ].join("\n"),
            "utf8"
        )
    );

    const dockerImage = `${packageJsonName}/keycloak-hot-reload`;
    const containerName = "keycloak-testing-container";

    fs.writeFileSync(
        pathJoin(keycloakThemeBuildingDirPath, "start_keycloak_testing_container.sh"),
        Buffer.from(
            [
                "#!/bin/bash",
                "",
                `docker rm ${containerName} || true`,
                "",
                `docker build . -t ${dockerImage}`,
                "",
                "docker run \\",
                "	-p 8080:8080 \\",
                `	--name ${containerName} \\`,
                "	-e KEYCLOAK_USER=admin \\",
                "	-e KEYCLOAK_PASSWORD=admin \\",
                `	-v ${pathJoin(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme", packageJsonName)
                }:/opt/jboss/keycloak/themes/${packageJsonName}:rw \\`,
                `	-it ${dockerImage}:latest`,
                ""
            ].join("\n"),
            "utf8"
        ),
        { "mode": 0o755 }
    );

    const standaloneHaFilePath = pathJoin(keycloakThemeBuildingDirPath, "configuration", "standalone-ha.xml");

    try { fs.mkdirSync(pathDirname(standaloneHaFilePath)); } catch { }

    fs.writeFileSync(
        standaloneHaFilePath,
        fs.readFileSync(pathJoin(__dirname, pathBasename(standaloneHaFilePath)))
    );

}