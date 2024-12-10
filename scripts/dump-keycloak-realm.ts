import { CONTAINER_NAME } from "../src/bin/shared/constants";
import child_process from "child_process";
import { SemVer } from "../src/bin/tools/SemVer";
import { join as pathJoin, relative as pathRelative } from "path";
import chalk from "chalk";
import { Deferred } from "evt/tools/Deferred";
import { assert, is } from "tsafe/assert";
import { run } from "./shared/run";

(async () => {
    const keycloakMajorVersionNumber = SemVer.parse(
        child_process
            .execSync(`docker inspect --format '{{.Config.Image}}' ${CONTAINER_NAME}`)
            .toString("utf8")
            .trim()
            .split(":")[1]
    ).major;

    {
        // https://github.com/keycloak/keycloak/issues/33800
        const doesUseLockedH2Database = keycloakMajorVersionNumber >= 26;

        if (doesUseLockedH2Database) {
            child_process.execSync(
                `docker exec ${CONTAINER_NAME} sh -c "cp -rp /opt/keycloak/data/h2 /tmp"`
            );
        }

        const dCompleted = new Deferred<void>();

        const child = child_process.spawn(
            "docker",
            [
                ...["exec", CONTAINER_NAME],
                ...["/opt/keycloak/bin/kc.sh", "export"],
                ...["--dir", "/tmp"],
                ...["--realm", "myrealm"],
                ...["--users", "realm_file"],
                ...(!doesUseLockedH2Database
                    ? []
                    : [
                          ...["--db", "dev-file"],
                          ...[
                              "--db-url",
                              "'jdbc:h2:file:/tmp/h2/keycloakdb;NON_KEYWORDS=VALUE'"
                          ]
                      ])
            ],
            { shell: true }
        );

        let output = "";

        const onExit = (code: number | null) => {
            dCompleted.reject(new Error(`Exited with code ${code}`));
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

            process.exit(1);
        }

        if (doesUseLockedH2Database) {
            run(`docker exec ${CONTAINER_NAME} sh -c "rm -rf /tmp/h2"`);
        }
    }

    const targetFilePath = pathRelative(
        process.cwd(),
        pathJoin(
            __dirname,
            "..",
            "src",
            "bin",
            "start-keycloak",
            `myrealm-realm-${keycloakMajorVersionNumber}.json`
        )
    );

    run(`docker cp ${CONTAINER_NAME}:/tmp/myrealm-realm.json ${targetFilePath}`);

    console.log(`${chalk.green(`✓ Exported realm to`)} ${chalk.bold(targetFilePath)}`);
})();
