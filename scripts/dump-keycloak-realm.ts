import { containerName } from "../src/bin/shared/constants";
import child_process from "child_process";
import { SemVer } from "../src/bin/tools/SemVer";
import { join as pathJoin, relative as pathRelative } from "path";
import chalk from "chalk";

run([`docker exec -it ${containerName}`, `/opt/keycloak/bin/kc.sh export`, `--dir /tmp`, `--realm myrealm`, `--users realm_file`].join(" "));

const keycloakMajorVersionNumber = SemVer.parse(
    child_process.execSync(`docker inspect --format '{{.Config.Image}}' ${containerName}`).toString("utf8").trim().split(":")[1]
).major;

const targetFilePath = pathRelative(
    process.cwd(),
    pathJoin(__dirname, "..", "src", "bin", "start-keycloak", `myrealm-realm-${keycloakMajorVersionNumber}.json`)
);

run(`docker cp ${containerName}:/tmp/myrealm-realm.json ${targetFilePath}`);

console.log(`${chalk.green(`✓ Exported realm to`)} ${chalk.bold(targetFilePath)}`);

function run(command: string) {
    console.log(chalk.grey(`$ ${command}`));

    return child_process.execSync(command, { "stdio": "inherit" });
}
