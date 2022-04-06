import { generateKeycloakThemeResources } from "./generateKeycloakThemeResources";
import { generateJavaStackFiles } from "./generateJavaStackFiles";
import { join as pathJoin, relative as pathRelative, basename as pathBasename } from "path";
import * as child_process from "child_process";
import { generateDebugFiles, containerLaunchScriptBasename } from "./generateDebugFiles";
import { URL } from "url";
import * as fs from "fs";
import { getIsM1 } from "../tools/isM1";

type ParsedPackageJson = {
    name: string;
    version: string;
    homepage?: string;
};

const reactProjectDirPath = process.cwd();

const doUseExternalAssets = process.argv[2]?.toLowerCase() === "--external-assets";

const parsedPackageJson: ParsedPackageJson = require(pathJoin(reactProjectDirPath, "package.json"));

export const keycloakThemeBuildingDirPath = pathJoin(reactProjectDirPath, "build_keycloak");

function sanitizeThemeName(name: string) {
    return name
        .replace(/^@(.*)/, "$1")
        .split("/")
        .join("-");
}

export function main() {
    console.log("🔏 Building the keycloak theme...⌚");

    const extraPagesId: string[] = (parsedPackageJson as any)["keycloakify"]?.["extraPages"] ?? [];
    const extraThemeProperties: string[] = (parsedPackageJson as any)["keycloakify"]?.["extraThemeProperties"] ?? [];
    const themeName = sanitizeThemeName(parsedPackageJson.name);

    generateKeycloakThemeResources({
        keycloakThemeBuildingDirPath,
        "reactAppBuildDirPath": pathJoin(reactProjectDirPath, "build"),
        themeName,
        ...(() => {
            const url = (() => {
                const { homepage } = parsedPackageJson;

                if (homepage !== undefined) {
                    return new URL(homepage);
                }

                const cnameFilePath = pathJoin(reactProjectDirPath, "public", "CNAME");

                if (fs.existsSync(cnameFilePath)) {
                    return new URL(`https://${fs.readFileSync(cnameFilePath).toString("utf8").replace(/\s+$/, "")}`);
                }

                return undefined;
            })();

            return {
                "urlPathname": url === undefined ? "/" : url.pathname.replace(/([^/])$/, "$1/"),
                "urlOrigin": !doUseExternalAssets
                    ? undefined
                    : (() => {
                          if (url === undefined) {
                              console.error("ERROR: You must specify 'homepage' in your package.json");
                              process.exit(-1);
                          }

                          return url.origin;
                      })(),
            };
        })(),
        extraPagesId,
        extraThemeProperties,
        //We have to leave it at that otherwise we break our default theme.
        //Problem is that we can't guarantee that the the old resources
        //will still be available on the newer keycloak version.
        "keycloakVersion": "11.0.3",
    });

    const { jarFilePath } = generateJavaStackFiles({
        version: parsedPackageJson.version,
        themeName,
        homepage: parsedPackageJson.homepage,
        keycloakThemeBuildingDirPath,
    });

    child_process.execSync("mvn package", {
        "cwd": keycloakThemeBuildingDirPath,
    });

    generateDebugFiles({
        keycloakThemeBuildingDirPath,
        themeName,
        //We want, however to test in a container running the latest Keycloak version
        //Except on M1 where we can't use the default image and we only have
        //https://github.com/InseeFrLab/keycloakify/issues/43#issuecomment-975699658
        "keycloakVersion": getIsM1() ? "15.0.2" : "16.1.0",
    });

    console.log(
        [
            "",
            `✅ Your keycloak theme has been generated and bundled into ./${pathRelative(reactProjectDirPath, jarFilePath)} 🚀`,
            `It is to be placed in "/opt/jboss/keycloak/standalone/deployments" in the container running a jboss/keycloak Docker image.`,
            "",
            "Using Helm (https://github.com/codecentric/helm-charts), edit to reflect:",
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
            "              mountPath: /opt/jboss/keycloak/standalone/deployments",
            "    extraEnv: |",
            "    - name: KEYCLOAK_USER",
            "      value: admin",
            "    - name: KEYCLOAK_PASSWORD",
            "      value: xxxxxxxxx",
            "    - name: JAVA_OPTS",
            "      value: -Dkeycloak.profile=preview",
            "",
            "",
            "To test your theme locally, with hot reloading, you can spin up a Keycloak container image with the theme loaded by running:",
            "",
            `👉 $ ./${pathRelative(reactProjectDirPath, pathJoin(keycloakThemeBuildingDirPath, containerLaunchScriptBasename))} 👈`,
            "",
            "Once your container is up and running: ",
            "- Log into the admin console 👉 http://localhost:8080 username: admin, password: admin 👈",
            '- Create a realm named "myrealm"',
            '- Create a client with id "myclient" and root url: "https://www.keycloak.org/app/"',
            `- Select Login Theme: ${themeName} (don't forget to save at the bottom of the page)`,
            `- Go to 👉 https://www.keycloak.org/app/ 👈 Click "Save" then "Sign in". You should see your login page`,
            "",
            "Video demoing this process: https://youtu.be/N3wlBoH4hKg",
            "",
        ].join("\n"),
    );
}
