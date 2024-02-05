#!/usr/bin/env node
import { join as pathJoin } from "path";
import { downloadAndUnzip } from "./tools/downloadAndUnzip";
import { promptKeycloakVersion } from "./promptKeycloakVersion";
import { getLogger } from "./tools/logger";
import { readBuildOptions, type BuildOptions } from "./keycloakify/buildOptions";
import { assert } from "tsafe/assert";
import * as child_process from "child_process";
import * as fs from "fs";
import { rmSync } from "./tools/fs.rmSync";
import { lastKeycloakVersionWithAccountV1 } from "./constants";
import { transformCodebase } from "./tools/transformCodebase";

export type BuildOptionsLike = {
    cacheDirPath: string;
};

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export async function downloadBuiltinKeycloakTheme(params: { keycloakVersion: string; destDirPath: string; buildOptions: BuildOptionsLike }) {
    const { keycloakVersion, destDirPath, buildOptions } = params;

    await downloadAndUnzip({
        "doUseCache": true,
        "cacheDirPath": buildOptions.cacheDirPath,
        destDirPath,
        "url": `https://github.com/keycloak/keycloak/archive/refs/tags/${keycloakVersion}.zip`,
        "specificDirsToExtract": ["", "-community"].map(ext => `keycloak-${keycloakVersion}/themes/src/main/resources${ext}/theme`),
        "preCacheTransform": {
            "actionCacheId": "npm install and build",
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

                    const packageManager = fs.existsSync(pathJoin(accountV2DirSrcDirPath, "pnpm-lock.yaml")) ? "pnpm" : "npm";

                    if (packageManager === "pnpm") {
                        try {
                            child_process.execSync(`which pnpm`);
                        } catch {
                            console.log(`Installing pnpm globally`);
                            child_process.execSync(`npm install -g pnpm`);
                        }
                    }

                    child_process.execSync(`${packageManager} install`, { "cwd": accountV2DirSrcDirPath, "stdio": "ignore" });

                    const packageJsonFilePath = pathJoin(accountV2DirSrcDirPath, "package.json");

                    const packageJsonRaw = fs.readFileSync(packageJsonFilePath);

                    const parsedPackageJson = JSON.parse(packageJsonRaw.toString("utf8"));

                    parsedPackageJson.scripts.build = parsedPackageJson.scripts.build
                        .replace(`${packageManager} run check-types`, "true")
                        .replace(`${packageManager} run babel`, "true");

                    fs.writeFileSync(packageJsonFilePath, Buffer.from(JSON.stringify(parsedPackageJson, null, 2), "utf8"));

                    child_process.execSync(`${packageManager} run build`, { "cwd": accountV2DirSrcDirPath, "stdio": "ignore" });

                    fs.writeFileSync(packageJsonFilePath, packageJsonRaw);

                    rmSync(pathJoin(accountV2DirSrcDirPath, "node_modules"), { "recursive": true });
                }

                last_account_v1_transformations: {
                    if (lastKeycloakVersionWithAccountV1 !== keycloakVersion) {
                        break last_account_v1_transformations;
                    }

                    {
                        const accountCssFilePath = pathJoin(destDirPath, "keycloak", "account", "resources", "css", "account.css");

                        fs.writeFileSync(
                            accountCssFilePath,
                            Buffer.from(fs.readFileSync(accountCssFilePath).toString("utf8").replace("top: -34px;", "top: -34px !important;"), "utf8")
                        );
                    }

                    {
                        const totpFtlFilePath = pathJoin(destDirPath, "base", "account", "totp.ftl");

                        fs.writeFileSync(
                            totpFtlFilePath,
                            Buffer.from(
                                fs
                                    .readFileSync(totpFtlFilePath)
                                    .toString("utf8")
                                    .replace(
                                        [
                                            "                <#list totp.policy.supportedApplications as app>",
                                            "                    <li>${app}</li>",
                                            "                </#list>"
                                        ].join("\n"),
                                        [
                                            "                <#if totp.policy.supportedApplications?has_content>",
                                            "                    <#list totp.policy.supportedApplications as app>",
                                            "                        <li>${app}</li>",
                                            "                    </#list>",
                                            "                </#if>"
                                        ].join("\n")
                                    ),
                                "utf8"
                            )
                        );
                    }

                    // Note, this is an optimization for reducing the size of the jar
                    {
                        const defaultThemeCommonResourcesDirPath = pathJoin(destDirPath, "keycloak", "common", "resources");

                        const usedCommonResourceRelativeFilePaths = [
                            ...["patternfly.min.css", "patternfly-additions.min.css", "patternfly-additions.min.css"].map(fileBasename =>
                                pathJoin("node_modules", "patternfly", "dist", "css", fileBasename)
                            ),
                            ...[
                                "OpenSans-Light-webfont.woff2",
                                "OpenSans-Regular-webfont.woff2",
                                "OpenSans-Bold-webfont.woff2",
                                "OpenSans-Semibold-webfont.woff2",
                                "OpenSans-Bold-webfont.woff",
                                "OpenSans-Light-webfont.woff",
                                "OpenSans-Regular-webfont.woff",
                                "OpenSans-Semibold-webfont.woff",
                                "OpenSans-Regular-webfont.ttf",
                                "OpenSans-Light-webfont.ttf",
                                "OpenSans-Semibold-webfont.ttf",
                                "OpenSans-Bold-webfont.ttf"
                            ].map(fileBasename => pathJoin("node_modules", "patternfly", "dist", "fonts", fileBasename))
                        ];

                        transformCodebase({
                            "srcDirPath": defaultThemeCommonResourcesDirPath,
                            "destDirPath": defaultThemeCommonResourcesDirPath,
                            "transformSourceCode": ({ sourceCode, fileRelativePath }) => {
                                if (!usedCommonResourceRelativeFilePaths.includes(fileRelativePath)) {
                                    return undefined;
                                }

                                return { "modifiedSourceCode": sourceCode };
                            }
                        });
                    }

                    // Other optimization: Remove AngularJS
                    {
                        const nodeModuleDirPath = pathJoin(destDirPath, "keycloak", "common", "resources", "node_modules");

                        fs.readdirSync(nodeModuleDirPath)
                            .filter(basename => basename.startsWith("angular"))
                            .map(basename => pathJoin(nodeModuleDirPath, basename))
                            .filter(dirPath => fs.statSync(dirPath).isDirectory())
                            .forEach(dirPath => rmSync(dirPath, { "recursive": true }));
                    }
                }
            }
        }
    });
}

async function main() {
    const buildOptions = readBuildOptions({
        "reactAppRootDirPath": process.cwd(),
        "processArgv": process.argv.slice(2)
    });

    const logger = getLogger({ "isSilent": buildOptions.isSilent });
    const { keycloakVersion } = await promptKeycloakVersion();

    const destDirPath = pathJoin(buildOptions.keycloakifyBuildDirPath, "src", "main", "resources", "theme");

    logger.log(`Downloading builtins theme of Keycloak ${keycloakVersion} here ${destDirPath}`);

    await downloadBuiltinKeycloakTheme({
        keycloakVersion,
        destDirPath,
        buildOptions
    });
}

if (require.main === module) {
    main();
}
