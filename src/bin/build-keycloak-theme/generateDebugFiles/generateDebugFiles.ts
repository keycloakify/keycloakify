import * as fs from "fs";
import { join as pathJoin, dirname as pathDirname } from "path";
import type { KeycloakVersion } from "../../KeycloakVersion";
import { getIsM1 } from "../../tools/isM1";

export const containerLaunchScriptBasename = "start_keycloak_testing_container.sh";

/** Files for being able to run a hot reload keycloak container */
export function generateDebugFiles(params: { keycloakVersion: KeycloakVersion; themeName: string; keycloakThemeBuildingDirPath: string }) {
    const { themeName, keycloakThemeBuildingDirPath, keycloakVersion } = params;

    fs.writeFileSync(
        pathJoin(keycloakThemeBuildingDirPath, "Dockerfile"),
        Buffer.from(
            [
                `FROM ${
                    getIsM1()
                        ? "eduardosanzb/keycloak@sha256:b1f5bc674eaff6f4e7b37808b9863440310ff93c282fc9bff812377be48bf519"
                        : `jboss/keycloak:${keycloakVersion}`
                }`,
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

    const standaloneHaFilePath = pathJoin(keycloakThemeBuildingDirPath, "configuration", `standalone-ha.xml`);

    try {
        fs.mkdirSync(pathDirname(standaloneHaFilePath));
    } catch {}

    fs.writeFileSync(
        standaloneHaFilePath,
        fs
            .readFileSync(pathJoin(__dirname, `standalone-ha_${keycloakVersion}.xml`))
            .toString("utf8")
            .replace(
                new RegExp(
                    ["<staticMaxAge>2592000</staticMaxAge>", "<cacheThemes>true</cacheThemes>", "<cacheTemplates>true</cacheTemplates>"].join("\\s*"),
                    "g",
                ),
                ["<staticMaxAge>-1</staticMaxAge>", "<cacheThemes>false</cacheThemes>", "<cacheTemplates>false</cacheTemplates>"].join("\n"),
            ),
    );
}
