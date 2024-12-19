import { CONTAINER_NAME } from "../src/bin/shared/constants";
import child_process from "child_process";
import { SemVer } from "../src/bin/tools/SemVer";
import { dumpContainerConfig } from "../src/bin/start-keycloak/realmConfig/dumpContainerConfig";
import { cacheDirPath } from "./shared/cacheDirPath";
import { getThisCodebaseRootDirPath } from "../src/bin/tools/getThisCodebaseRootDirPath";
import { writeRealmJsonFile } from "../src/bin/start-keycloak/realmConfig/ParsedRealmJson";
import { join as pathJoin } from "path";
import chalk from "chalk";

(async () => {
    const keycloakMajorVersionNumber = SemVer.parse(
        child_process
            .execSync(`docker inspect --format '{{.Config.Image}}' ${CONTAINER_NAME}`)
            .toString("utf8")
            .trim()
            .split(":")[1]
    ).major;

    const parsedRealmJson = await dumpContainerConfig({
        buildContext: {
            cacheDirPath
        },
        keycloakMajorVersionNumber,
        realmName: "myrealm"
    });

    const realmJsonFilePath = pathJoin(
        getThisCodebaseRootDirPath(),
        "src",
        "bin",
        "start-keycloak",
        "realmConfig",
        "defaultConfig",
        `realm-kc-${keycloakMajorVersionNumber}.json`
    );

    await writeRealmJsonFile({
        parsedRealmJson,
        realmJsonFilePath,
        keycloakMajorVersionNumber
    });

    console.log(chalk.green(`Realm config dumped to ${realmJsonFilePath}`));
})();
