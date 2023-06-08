import { generateTheme } from "./generateTheme";
import { generateJavaStackFiles } from "./generateJavaStackFiles";
import { join as pathJoin, relative as pathRelative, basename as pathBasename, sep as pathSep } from "path";
import * as child_process from "child_process";
import { generateStartKeycloakTestingContainer } from "./generateStartKeycloakTestingContainer";
import * as fs from "fs";
import { readBuildOptions } from "./BuildOptions";
import { getLogger } from "../tools/logger";
import jar from "../tools/jar";
import { assert } from "tsafe/assert";
import { Equals } from "tsafe";
import { getEmailThemeSrcDirPath } from "../getSrcDirPath";
import { getProjectRoot } from "../tools/getProjectRoot";

export async function main() {
    const projectDirPath = process.cwd();

    const buildOptions = readBuildOptions({
        projectDirPath,
        "processArgv": process.argv.slice(2)
    });

    const logger = getLogger({ "isSilent": buildOptions.isSilent });
    logger.log("🔏 Building the keycloak theme...⌚");

    let doBundlesEmailTemplate: boolean | undefined;

    for (const themeName of [buildOptions.themeName, ...buildOptions.extraThemeNames]) {
        const { doBundlesEmailTemplate: doBundlesEmailTemplate_ } = await generateTheme({
            keycloakThemeBuildingDirPath: buildOptions.keycloakifyBuildDirPath,
            "emailThemeSrcDirPath": (() => {
                const { emailThemeSrcDirPath } = getEmailThemeSrcDirPath({ projectDirPath });

                if (emailThemeSrcDirPath === undefined || !fs.existsSync(emailThemeSrcDirPath)) {
                    return;
                }

                return emailThemeSrcDirPath;
            })(),
            "reactAppBuildDirPath": buildOptions.reactAppBuildDirPath,
            "buildOptions": {
                ...buildOptions,
                "themeName": themeName
            },
            "keycloakifyVersion": (() => {
                const version = JSON.parse(fs.readFileSync(pathJoin(getProjectRoot(), "package.json")).toString("utf8"))["version"];

                assert(typeof version === "string");

                return version;
            })()
        });

        doBundlesEmailTemplate ??= doBundlesEmailTemplate_;
    }

    assert(doBundlesEmailTemplate !== undefined);

    const { jarFilePath } = generateJavaStackFiles({
        keycloakThemeBuildingDirPath: buildOptions.keycloakifyBuildDirPath,
        doBundlesEmailTemplate,
        buildOptions
    });

    switch (buildOptions.bundler) {
        case "none":
            logger.log("😱 Skipping bundling step, there will be no jar");
            break;
        case "keycloakify":
            logger.log("🫶 Let keycloakify do its thang");
            await jar({
                "rootPath": buildOptions.keycloakifyBuildDirPath,
                "version": buildOptions.themeVersion,
                "groupId": buildOptions.groupId,
                "artifactId": buildOptions.artifactId,
                "targetPath": jarFilePath
            });
            break;
        case "mvn":
            logger.log("🫙 Run maven to deliver a jar");
            child_process.execSync("mvn package", { "cwd": buildOptions.keycloakifyBuildDirPath });
            break;
        default:
            assert<Equals<typeof buildOptions.bundler, never>>(false);
    }

    // We want, however, to test in a container running the latest Keycloak version
    const containerKeycloakVersion = "20.0.1";

    generateStartKeycloakTestingContainer({
        keycloakThemeBuildingDirPath: buildOptions.keycloakifyBuildDirPath,
        "keycloakVersion": containerKeycloakVersion,
        buildOptions
    });

    logger.log(
        [
            "",
            `✅ Your keycloak theme has been generated and bundled into .${pathSep}${pathRelative(projectDirPath, jarFilePath)} 🚀`,
            `It is to be placed in "/opt/keycloak/providers" in the container running a quay.io/keycloak/keycloak Docker image.`,
            "",
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
                projectDirPath,
                pathJoin(buildOptions.keycloakifyBuildDirPath, generateStartKeycloakTestingContainer.basename)
            )} 👈`,
            "",
            `Test with different Keycloak versions by editing the .sh file. see available versions here: https://quay.io/repository/keycloak/keycloak?tab=tags`,
            ``,
            `Once your container is up and running: `,
            "- Log into the admin console 👉 http://localhost:8080/admin username: admin, password: admin 👈",
            `- Create a realm:                       Master         -> AddRealm   -> Name: myrealm`,
            `- Enable registration:                  Realm settings -> Login tab  -> User registration: on`,
            `- Enable the Account theme (optional):  Realm settings -> Themes tab -> Account theme: ${buildOptions.themeName}`,
            `                                        Clients        -> account    -> Login theme:   ${buildOptions.themeName}`,
            `- Enable the email theme (optional):    Realm settings -> Themes tab -> Email theme:   ${buildOptions.themeName} (option will appear only if you have ran npx initialize-email-theme)`,
            `- Create a client                       Clients        -> Create     -> Client ID:                       myclient`,
            `                                                                        Root URL:                        https://www.keycloak.org/app/`,
            `                                                                        Valid redirect URIs:             https://www.keycloak.org/app* http://localhost* (localhost is optional)`,
            `                                                                        Valid post logout redirect URIs: https://www.keycloak.org/app* http://localhost*`,
            `                                                                        Web origins:                     *`,
            `                                                                        Login Theme:                     ${buildOptions.themeName}`,
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
