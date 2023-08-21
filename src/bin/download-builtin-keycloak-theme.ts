#!/usr/bin/env node
import { join as pathJoin } from "path";
import { downloadAndUnzip } from "./tools/downloadAndUnzip";
import { promptKeycloakVersion } from "./promptKeycloakVersion";
import { getLogger } from "./tools/logger";
import { readBuildOptions } from "./keycloakify/BuildOptions";
import * as child_process from "child_process";
import * as fs from "fs";

export async function downloadBuiltinKeycloakTheme(params: { projectDirPath: string; keycloakVersion: string; destDirPath: string }) {
    const { projectDirPath, keycloakVersion, destDirPath } = params;

    const start = Date.now();

    console.log("Downloading Keycloak theme...", { keycloakVersion });

    await downloadAndUnzip({
        projectDirPath,
        destDirPath,
        "url": `https://github.com/keycloak/keycloak/archive/refs/tags/${keycloakVersion}.zip`,
        "specificDirsToExtract": ["", "-community"].map(ext => `keycloak-${keycloakVersion}/themes/src/main/resources${ext}/theme`),
        "preCacheTransform": {
            "actionCacheId": "Build Keycloak resources",
            "action": async ({ destDirPath }) => {
                install_common_node_modules: {
                    const commonResourcesDirPath = pathJoin(destDirPath, "keycloak", "common", "resources");

                    if (!fs.existsSync(commonResourcesDirPath)) {
                        break install_common_node_modules;
                    }

                    if (!fs.existsSync(pathJoin(commonResourcesDirPath, "package.json"))) {
                        break install_common_node_modules;
                    }

                    if (fs.existsSync(pathJoin(commonResourcesDirPath, "node_modules"))) {
                        break install_common_node_modules;
                    }

                    child_process.execSync("npm install --omit=dev", {
                        "cwd": commonResourcesDirPath,
                        "stdio": "ignore"
                    });
                }

                install_and_move_to_common_resources_generated_in_keycloak_v2: {
                    const accountV2DirSrcDirPath = pathJoin(destDirPath, "keycloak.v2", "account", "src");

                    if (!fs.existsSync(accountV2DirSrcDirPath)) {
                        break install_and_move_to_common_resources_generated_in_keycloak_v2;
                    }

                    child_process.execSync("npm install", { "cwd": accountV2DirSrcDirPath, "stdio": "ignore" });

                    const packageJsonFilePath = pathJoin(accountV2DirSrcDirPath, "package.json");

                    const packageJsonRaw = fs.readFileSync(packageJsonFilePath);

                    const parsedPackageJson = JSON.parse(packageJsonRaw.toString("utf8"));

                    parsedPackageJson.scripts.build = parsedPackageJson.scripts.build
                        .replace("npm run check-types", "true")
                        .replace("npm run babel", "true");

                    fs.writeFileSync(packageJsonFilePath, Buffer.from(JSON.stringify(parsedPackageJson, null, 2), "utf8"));

                    child_process.execSync("npm run build", { "cwd": accountV2DirSrcDirPath, "stdio": "ignore" });

                    fs.writeFileSync(packageJsonFilePath, packageJsonRaw);

                    fs.rmSync(pathJoin(accountV2DirSrcDirPath, "node_modules"), { "recursive": true });
                }
            }
        }
    });

    console.log("Downloaded Keycloak theme in", Date.now() - start, "ms");
}

async function main() {
    const buildOptions = readBuildOptions({
        "projectDirPath": process.cwd(),
        "processArgv": process.argv.slice(2)
    });

    const logger = getLogger({ "isSilent": buildOptions.isSilent });
    const { keycloakVersion } = await promptKeycloakVersion();

    const destDirPath = pathJoin(buildOptions.keycloakifyBuildDirPath, "src", "main", "resources", "theme");

    logger.log(`Downloading builtins theme of Keycloak ${keycloakVersion} here ${destDirPath}`);

    await downloadBuiltinKeycloakTheme({
        "projectDirPath": process.cwd(),
        keycloakVersion,
        destDirPath
    });
}

if (require.main === module) {
    main();
}
