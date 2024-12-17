import { CONTAINER_NAME } from "../../shared/constants";
import child_process from "child_process";
import { join as pathJoin, dirname as pathDirname, basename as pathBasename } from "path";
import chalk from "chalk";
import { Deferred } from "evt/tools/Deferred";
import { assert, is } from "tsafe/assert";
import type { BuildContext } from "../../shared/buildContext";
import { type ParsedRealmJson, readRealmJsonFile } from "./ParsedRealmJson";

export type BuildContextLike = {
    cacheDirPath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export async function dumpContainerConfig(params: {
    realmName: string;
    keycloakMajorVersionNumber: number;
    buildContext: BuildContextLike;
}): Promise<ParsedRealmJson> {
    const { realmName, keycloakMajorVersionNumber, buildContext } = params;

    // https://github.com/keycloak/keycloak/issues/33800
    const doesUseLockedH2Database = keycloakMajorVersionNumber >= 25;

    if (doesUseLockedH2Database) {
        const dCompleted = new Deferred<void>();

        const cmd = `docker exec ${CONTAINER_NAME} sh -c "cp -rp /opt/keycloak/data/h2 /tmp"`;

        child_process.exec(cmd, error => {
            if (error !== null) {
                dCompleted.reject(error);
                return;
            }

            dCompleted.resolve();
        });

        try {
            await dCompleted.pr;
        } catch (error) {
            assert(is<Error>(error));

            console.log(chalk.red(`Docker command failed: ${cmd}`));

            console.log(chalk.red(error.message));

            throw error;
        }
    }

    {
        const dCompleted = new Deferred<void>();

        const child = child_process.spawn(
            "docker",
            [
                ...["exec", CONTAINER_NAME],
                ...["/opt/keycloak/bin/kc.sh", "export"],
                ...["--dir", "/tmp"],
                ...["--realm", realmName],
                ...["--users", "realm_file"],
                ...(!doesUseLockedH2Database
                    ? []
                    : [
                          ...["--db", "dev-file"],
                          ...[
                              "--db-url",
                              '"jdbc:h2:file:/tmp/h2/keycloakdb;NON_KEYWORDS=VALUE"'
                          ]
                      ])
            ],
            { shell: true }
        );

        let output = "";

        const onExit = (code: number | null) => {
            dCompleted.reject(
                new Error(`docker exec kc.sh export command failed with code ${code}`)
            );
        };

        child.once("exit", onExit);

        child.stdout.on("data", data => {
            const outputStr = data.toString("utf8");

            if (outputStr.includes("Export finished successfully")) {
                child.removeListener("exit", onExit);

                // NOTE: On older Keycloak versions the process keeps running after the export is done.
                const timer = setTimeout(() => {
                    child.removeListener("exit", onExit2);
                    child.kill();
                    dCompleted.resolve();
                }, 1500);

                const onExit2 = () => {
                    clearTimeout(timer);
                    dCompleted.resolve();
                };

                child.once("exit", onExit2);
            }

            output += outputStr;
        });

        child.stderr.on("data", data => (output += chalk.red(data.toString("utf8"))));

        try {
            await dCompleted.pr;
        } catch (error) {
            assert(is<Error>(error));

            console.log(chalk.red(error.message));

            console.log(output);

            throw error;
        }
    }

    if (doesUseLockedH2Database) {
        const dCompleted = new Deferred<void>();

        const cmd = `docker exec ${CONTAINER_NAME} sh -c "rm -rf /tmp/h2"`;

        child_process.exec(cmd, error => {
            if (error !== null) {
                dCompleted.reject(error);
                return;
            }

            dCompleted.resolve();
        });

        try {
            await dCompleted.pr;
        } catch (error) {
            assert(is<Error>(error));

            console.log(chalk.red(`Docker command failed: ${cmd}`));

            console.log(chalk.red(error.message));

            throw error;
        }
    }

    const targetRealmConfigJsonFilePath_tmp = pathJoin(
        buildContext.cacheDirPath,
        "realm.json"
    );

    {
        const dCompleted = new Deferred<void>();

        const cmd = `docker cp ${CONTAINER_NAME}:/tmp/${realmName}-realm.json ${pathBasename(targetRealmConfigJsonFilePath_tmp)}`;

        child_process.exec(
            cmd,
            {
                cwd: pathDirname(targetRealmConfigJsonFilePath_tmp)
            },
            error => {
                if (error !== null) {
                    dCompleted.reject(error);
                    return;
                }

                dCompleted.resolve();
            }
        );

        try {
            await dCompleted.pr;
        } catch (error) {
            assert(is<Error>(error));

            console.log(chalk.red(`Docker command failed: ${cmd}`));

            console.log(chalk.red(error.message));

            throw error;
        }
    }

    return readRealmJsonFile({
        realmJsonFilePath: targetRealmConfigJsonFilePath_tmp
    });
}
