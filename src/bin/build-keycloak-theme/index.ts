#!/usr/bin/env node

import { generateKeycloakThemeResources } from "./generateKeycloakThemeResources";
import { generateJavaStackFiles } from "./generateJavaStackFiles";
import type { ParsedPackageJson } from "./generateJavaStackFiles";
import { join as pathJoin, relative as pathRelative, basename as pathBasename } from "path";
import * as child_process from "child_process";
import { generateDebugFiles, containerLaunchScriptBasename } from "./generateDebugFiles";


const reactProjectDirPath = process.cwd();

const parsedPackageJson: ParsedPackageJson = require(pathJoin(reactProjectDirPath, "package.json"));

export const keycloakThemeBuildingDirPath = pathJoin(reactProjectDirPath, "build_keycloak");


console.log("🔏 Building the keycloak theme...⌚");

if (require.main === module) {

    generateKeycloakThemeResources({
        keycloakThemeBuildingDirPath,
        "reactAppBuildDirPath": pathJoin(reactProjectDirPath, "build"),
        "themeName": parsedPackageJson.name
    });

    const { jarFilePath } = generateJavaStackFiles({
        parsedPackageJson,
        keycloakThemeBuildingDirPath
    });

    child_process.execSync(
        "mvn package",
        { "cwd": keycloakThemeBuildingDirPath }
    );

    generateDebugFiles({
        keycloakThemeBuildingDirPath,
        "packageJsonName": parsedPackageJson.name
    });

    console.log([
        '',
        `✅ Your keycloak theme has been generated and bundled into ./${pathRelative(reactProjectDirPath, jarFilePath)} 🚀`,
        `It is to be placed in "/opt/jboss/keycloak/standalone/deployments" in the container running a jboss/keycloak Docker image. (Tested with 11.0.3)`,
        '',
        'Using Helm (https://github.com/codecentric/helm-charts), edit to reflect:',
        '',
        'value.yaml: ',
        '    extraInitContainers: |',
        '        - name: realm-ext-provider',
        '          image: curlimages/curl',
        '          imagePullPolicy: IfNotPresent',
        '          command:',
        '            - sh',
        '          args:',
        '            - -c',
        `            - curl -L -f -S -o /extensions/${pathBasename(jarFilePath)} https://AN.URL.FOR/${pathBasename(jarFilePath)}`,
        '          volumeMounts:',
        '            - name: extensions',
        '              mountPath: /extensions',
        '        ',
        '        extraVolumeMounts: |',
        '            - name: extensions',
        '              mountPath: /opt/jboss/keycloak/standalone/deployments',
        '',
        '',
        'To test your theme locally, with hot reloading, you can spin up a Keycloak container image with the theme loaded by running:',
        '',
        `$ ./${pathRelative(reactProjectDirPath, pathJoin(keycloakThemeBuildingDirPath, containerLaunchScriptBasename))}`,
        '',
        'To enable the theme within keycloak log into the admin console ( username: admin, password: admin), create a realm (called "myrealm" for example),',
        `go to your realm settings, click on the theme tab then select ${parsedPackageJson.name}.`,
        `More details: https://www.keycloak.org/getting-started/getting-started-docker`,
        '',
        'Once your container is up and configured 👉 http://localhost:8080/auth/realms/myrealm/account',
        '',
    ].join("\n"));

}
