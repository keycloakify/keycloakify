import { generateTheme } from "./generateTheme";
import { generateJavaStackFiles } from "./generateJavaStackFiles";
import { join as pathJoin, relative as pathRelative, basename as pathBasename, sep as pathSep } from "path";
import * as child_process from "child_process";
import { generateStartKeycloakTestingContainer } from "./generateStartKeycloakTestingContainer";
import * as fs from "fs";
import { readBuildOptions } from "./BuildOptions";
import { getLogger } from "../tools/logger";
import { assert } from "tsafe/assert";
import { getThemeSrcDirPath } from "../getSrcDirPath";
import { getProjectRoot } from "../tools/getProjectRoot";
import { objectKeys } from "tsafe/objectKeys";

export async function main() {
    const reactAppRootDirPath = process.cwd();

    const buildOptions = readBuildOptions({
        reactAppRootDirPath,
        "processArgv": process.argv.slice(2)
    });

    const logger = getLogger({ "isSilent": buildOptions.isSilent });
    logger.log("🔏 Building the keycloak theme...⌚");

    const keycloakifyDirPath = getProjectRoot();

    const { themeSrcDirPath } = getThemeSrcDirPath({ reactAppRootDirPath });

    for (const themeName of buildOptions.themeNames) {
        await generateTheme({
            themeName,
            themeSrcDirPath,
            "keycloakifySrcDirPath": pathJoin(keycloakifyDirPath, "src"),
            buildOptions,
            "keycloakifyVersion": (() => {
                const version = JSON.parse(fs.readFileSync(pathJoin(keycloakifyDirPath, "package.json")).toString("utf8"))["version"];

                assert(typeof version === "string");

                return version;
            })()
        });
    }

    const { jarFilePath } = await generateJavaStackFiles({
        "implementedThemeTypes": (() => {
            const implementedThemeTypes = {
                "login": false,
                "account": false,
                "email": false
            };

            for (const themeType of objectKeys(implementedThemeTypes)) {
                if (!fs.existsSync(pathJoin(themeSrcDirPath, themeType))) {
                    continue;
                }
                implementedThemeTypes[themeType] = true;
            }

            return implementedThemeTypes;
        })(),
        buildOptions
    });

    if (buildOptions.doCreateJar) {
        child_process.execSync("mvn package", { "cwd": buildOptions.keycloakifyBuildDirPath });
    }

    // We want, however, to test in a container running the latest Keycloak version
    const containerKeycloakVersion = "21.1.2";

    generateStartKeycloakTestingContainer({
        "keycloakVersion": containerKeycloakVersion,
        buildOptions
    });

    logger.log(
        [
            "",
            ...(!buildOptions.doCreateJar
                ? []
                : [
                      `✅ Your keycloak theme has been generated and bundled into .${pathSep}${pathRelative(reactAppRootDirPath, jarFilePath)} 🚀`,
                      `It is to be placed in "/opt/keycloak/providers" in the container running a quay.io/keycloak/keycloak Docker image.`,
                      ""
                  ]),
            //TODO: Restore when we find a good Helm chart for Keycloak.
            //"Using Helm (https://github.com/codecentric/helm-charts), edit to reflect:",
            "",
            "value.yaml: ",
            "    extraInitContainers: |",
            "        - name: realm-ext-provider",
            "          image: curlimages/curl",
            "          imagePullPolicy: IfNotPresent",
            "          command:",
            "            - sh",
            "          args:",
            "            - -c",
            `            - curl -L -f -S -o /extensions/${pathBasename(jarFilePath)} https://AN.URL.FOR/${pathBasename(jarFilePath)}`,
            "          volumeMounts:",
            "            - name: extensions",
            "              mountPath: /extensions",
            "        ",
            "        extraVolumeMounts: |",
            "            - name: extensions",
            "              mountPath: /opt/keycloak/providers",
            "    extraEnv: |",
            "    - name: KEYCLOAK_USER",
            "      value: admin",
            "    - name: KEYCLOAK_PASSWORD",
            "      value: xxxxxxxxx",
            "    - name: JAVA_OPTS",
            "      value: -Dkeycloak.profile=preview",
            "",
            "",
            `To test your theme locally you can spin up a Keycloak ${containerKeycloakVersion} container image with the theme pre loaded by running:`,
            "",
            `👉 $ .${pathSep}${pathRelative(
                reactAppRootDirPath,
                pathJoin(buildOptions.keycloakifyBuildDirPath, generateStartKeycloakTestingContainer.basename)
            )} 👈`,
            "",
            `Test with different Keycloak versions by editing the .sh file. see available versions here: https://quay.io/repository/keycloak/keycloak?tab=tags`,
            ``,
            `Once your container is up and running: `,
            "- Log into the admin console 👉 http://localhost:8080/admin username: admin, password: admin 👈",
            `- Create a realm:                       Master         -> AddRealm   -> Name: myrealm`,
            `- Enable registration:                  Realm settings -> Login tab  -> User registration: on`,
            `- Enable the Account theme (optional):  Realm settings -> Themes tab -> Account theme: ${buildOptions.themeNames[0]}`,
            `                                        Clients        -> account    -> Login theme:   ${buildOptions.themeNames[0]}`,
            `- Enable the email theme (optional):    Realm settings -> Themes tab -> Email theme:   ${buildOptions.themeNames[0]} (option will appear only if you have ran npx initialize-email-theme)`,
            `- Create a client                       Clients        -> Create     -> Client ID:                       myclient`,
            `                                                                        Root URL:                        https://www.keycloak.org/app/`,
            `                                                                        Valid redirect URIs:             https://www.keycloak.org/app* http://localhost* (localhost is optional)`,
            `                                                                        Valid post logout redirect URIs: https://www.keycloak.org/app* http://localhost*`,
            `                                                                        Web origins:                     *`,
            `                                                                        Login Theme:                     ${buildOptions.themeNames[0]}`,
            `                                                                        Save (button at the bottom of the page)`,
            ``,
            `- Go to  👉  https://www.keycloak.org/app/ 👈 Click "Save" then "Sign in". You should see your login page`,
            `- Got to 👉  http://localhost:8080/realms/myrealm/account 👈 to see your account theme`,
            ``,
            `Video tutorial: https://youtu.be/WMyGZNHQkjU`,
            ``
        ].join("\n")
    );
}
