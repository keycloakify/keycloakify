#!/usr/bin/env node
import { join as pathJoin } from "path";
import { downloadAndUnzip } from "./tools/downloadAndUnzip";
import { promptKeycloakVersion } from "./promptKeycloakVersion";
import { getLogger } from "./tools/logger";
import { readBuildOptions } from "./keycloakify/BuildOptions";
import * as child_process from "child_process";
import * as fs from "fs";

export async function downloadBuiltinKeycloakTheme(params: { keycloakVersion: string; destDirPath: string; isSilent: boolean }) {
    const { keycloakVersion, destDirPath } = params;

    await Promise.all(
        ["", "-community"].map(ext =>
            downloadAndUnzip({
                "destDirPath": destDirPath,
                "url": `https://github.com/keycloak/keycloak/archive/refs/tags/${keycloakVersion}.zip`,
                "pathOfDirToExtractInArchive": `keycloak-${keycloakVersion}/themes/src/main/resources${ext}/theme`
            })
        )
    );

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

        console.log("npm install --omit=dev start", { keycloakVersion });

        const start = Date.now();

        child_process.execSync("npm install --omit=dev", {
            "cwd": commonResourcesDirPath,
            "stdio": "ignore"
        });

        console.log("npm install --omit=dev end", { keycloakVersion, "time": Date.now() - start });
    }

    install_and_move_to_common_resources_generated_in_keycloak_v2: {
        const accountV2DirSrcDirPath = pathJoin(destDirPath, "keycloak.v2", "account", "src");

        if (!fs.existsSync(accountV2DirSrcDirPath)) {
            break install_and_move_to_common_resources_generated_in_keycloak_v2;
        }

        console.log("npm install start", { keycloakVersion });
        const startInstall = Date.now();

        child_process.execSync("npm install", { "cwd": accountV2DirSrcDirPath, "stdio": "ignore" });

        console.log("npm install end", { keycloakVersion, "time": Date.now() - startInstall });

        const packageJsonFilePath = pathJoin(accountV2DirSrcDirPath, "package.json");

        const packageJsonRaw = fs.readFileSync(packageJsonFilePath);

        const parsedPackageJson = JSON.parse(packageJsonRaw.toString("utf8"));

        parsedPackageJson.scripts.build = parsedPackageJson.scripts.build.replace("npm run check-types", "true").replace("npm run babel", "true");

        fs.writeFileSync(packageJsonFilePath, Buffer.from(JSON.stringify(parsedPackageJson, null, 2), "utf8"));

        console.log("npm run build start", { keycloakVersion });
        const start = Date.now();

        child_process.execSync("npm run build", { "cwd": accountV2DirSrcDirPath, "stdio": "ignore" });

        console.log("npm run build end", { keycloakVersion, "time": Date.now() - start });

        fs.writeFileSync(packageJsonFilePath, packageJsonRaw);
    }
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
        keycloakVersion,
        destDirPath,
        "isSilent": buildOptions.isSilent
    });
}

if (require.main === module) {
    main();
}
