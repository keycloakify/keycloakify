
import * as fs from "fs";
import { join as pathJoin, dirname as pathDirname, basename as pathBasename } from "path";

export const containerLaunchScriptBasename = "start_keycloak_testing_container.sh";

/** Files for being able to run a hot reload keycloak container */
export function generateDebugFiles(
    params: {
        themeName: string;
        keycloakThemeBuildingDirPath: string;
    }
) {

    const { themeName, keycloakThemeBuildingDirPath } = params;

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

    const dockerImage = `${themeName}/keycloak-hot-reload`;
    const containerName = "keycloak-testing-container";

    fs.writeFileSync(
        pathJoin(keycloakThemeBuildingDirPath, containerLaunchScriptBasename),
        Buffer.from(
            [
                "#!/bin/bash",
                "",
                `cd ${keycloakThemeBuildingDirPath}`,
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
                `	-v ${pathJoin(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme", themeName)
                }:/opt/jboss/keycloak/themes/${themeName}:rw \\`,
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