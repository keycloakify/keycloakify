import * as fs from "fs";
import { join as pathJoin, dirname as pathDirname } from "path";

export const containerLaunchScriptBasename =
    "start_keycloak_testing_container.sh";

/** Files for being able to run a hot reload keycloak container */
export function generateDebugFiles(params: {
    keycloakVersion: "11.0.3" | "15.0.2";
    themeName: string;
    keycloakThemeBuildingDirPath: string;
}) {
    const { themeName, keycloakThemeBuildingDirPath, keycloakVersion } = params;

    fs.writeFileSync(
        pathJoin(keycloakThemeBuildingDirPath, "Dockerfile"),
        Buffer.from(
            [
                `FROM jboss/keycloak:${keycloakVersion}`,
                "",
                "USER root",
                "",
                "WORKDIR /",
                "",
                "ADD configuration /opt/jboss/keycloak/standalone/configuration/",
                "",
                'ENTRYPOINT [ "/opt/jboss/tools/docker-entrypoint.sh" ]',
            ].join("\n"),
            "utf8",
        ),
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
                "   -p 8080:8080 \\",
                `   --name ${containerName} \\`,
                "   -e KEYCLOAK_USER=admin \\",
                "   -e KEYCLOAK_PASSWORD=admin \\",
                "   -e JAVA_OPTS=-Dkeycloak.profile=preview \\",
                `   -v ${pathJoin(
                    keycloakThemeBuildingDirPath,
                    "src",
                    "main",
                    "resources",
                    "theme",
                    themeName,
                )}:/opt/jboss/keycloak/themes/${themeName}:rw \\`,
                `   -it ${dockerImage}:latest`,
                "",
            ].join("\n"),
            "utf8",
        ),
        { "mode": 0o755 },
    );

    const standaloneHaFilePath = pathJoin(
        keycloakThemeBuildingDirPath,
        "configuration",
        `standalone-ha.xml`,
    );

    try {
        fs.mkdirSync(pathDirname(standaloneHaFilePath));
    } catch {}

    fs.writeFileSync(
        standaloneHaFilePath,
        fs
            .readFileSync(
                pathJoin(__dirname, `standalone-ha_${keycloakVersion}.xml`),
            )
            .toString("utf8")
            .replace(
                new RegExp(
                    [
                        "<staticMaxAge>2592000</staticMaxAge>",
                        "<cacheThemes>true</cacheThemes>",
                        "<cacheTemplates>true</cacheTemplates>",
                    ].join("\\s*"),
                    "g",
                ),
                [
                    "<staticMaxAge>-1</staticMaxAge>",
                    "<cacheThemes>false</cacheThemes>",
                    "<cacheTemplates>false</cacheTemplates>",
                ].join("\n"),
            ),
    );
}
