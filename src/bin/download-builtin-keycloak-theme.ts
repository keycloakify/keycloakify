#!/usr/bin/env node
import { join as pathJoin } from "path";
import { downloadAndUnzip } from "./downloadAndUnzip";
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
    npmWorkspaceRootDirPath: string;
};

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export async function downloadBuiltinKeycloakTheme(params: { keycloakVersion: string; destDirPath: string; buildOptions: BuildOptionsLike }) {
    const { keycloakVersion, destDirPath, buildOptions } = params;

    await downloadAndUnzip({
        destDirPath,
        "url": `https://github.com/keycloak/keycloak/archive/refs/tags/${keycloakVersion}.zip`,
        "specificDirsToExtract": ["", "-community"].map(ext => `keycloak-${keycloakVersion}/themes/src/main/resources${ext}/theme`),
        buildOptions,
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

                remove_keycloak_v2: {
                    const keycloakV2DirPath = pathJoin(destDirPath, "keycloak.v2");

                    if (!fs.existsSync(keycloakV2DirPath)) {
                        break remove_keycloak_v2;
                    }

                    rmSync(keycloakV2DirPath, { "recursive": true });
                }

                // Note, this is an optimization for reducing the size of the jar
                remove_unused_node_modules: {
                    const nodeModuleDirPath = pathJoin(destDirPath, "keycloak", "common", "resources", "node_modules");

                    if (!fs.existsSync(nodeModuleDirPath)) {
                        break remove_unused_node_modules;
                    }

                    const toDeletePerfixes = [
                        "angular",
                        "bootstrap",
                        "rcue",
                        "font-awesome",
                        "ng-file-upload",
                        pathJoin("patternfly", "dist", "sass"),
                        pathJoin("patternfly", "dist", "less"),
                        pathJoin("patternfly", "dist", "js"),
                        "d3",
                        pathJoin("jquery", "src"),
                        "c3",
                        "core-js",
                        "eonasdan-bootstrap-datetimepicker",
                        "moment",
                        "react",
                        "patternfly-bootstrap-treeview",
                        "popper.js",
                        "tippy.js",
                        "jquery-match-height",
                        "google-code-prettify",
                        "patternfly-bootstrap-combobox",
                        "focus-trap",
                        "tabbable",
                        "scheduler",
                        "@types",
                        "datatables.net",
                        "datatables.net-colreorder",
                        "tslib",
                        "prop-types",
                        "file-selector",
                        "datatables.net-colreorder-bs",
                        "object-assign",
                        "warning",
                        "js-tokens",
                        "loose-envify",
                        "prop-types-extra",
                        "attr-accept",
                        "datatables.net-select",
                        "drmonty-datatables-colvis",
                        "datatables.net-bs",
                        pathJoin("@patternfly", "react"),
                        pathJoin("@patternfly", "patternfly", "docs")
                    ];

                    transformCodebase({
                        "srcDirPath": nodeModuleDirPath,
                        "destDirPath": nodeModuleDirPath,
                        "transformSourceCode": ({ sourceCode, fileRelativePath }) => {
                            if (fileRelativePath.endsWith(".map")) {
                                return undefined;
                            }

                            if (toDeletePerfixes.find(prefix => fileRelativePath.startsWith(prefix)) !== undefined) {
                                return undefined;
                            }

                            if (fileRelativePath.startsWith(pathJoin("patternfly", "dist", "fonts"))) {
                                if (
                                    !fileRelativePath.endsWith(".woff2") &&
                                    !fileRelativePath.endsWith(".woff") &&
                                    !fileRelativePath.endsWith(".ttf")
                                ) {
                                    return undefined;
                                }
                            }

                            return { "modifiedSourceCode": sourceCode };
                        }
                    });
                }

                // Just like node_modules
                remove_unused_lib: {
                    const libDirPath = pathJoin(destDirPath, "keycloak", "common", "resources", "lib");

                    if (!fs.existsSync(libDirPath)) {
                        break remove_unused_lib;
                    }

                    const toDeletePerfixes = ["ui-ace", "filesaver", "fileupload", "angular", "ui-ace", "pficon"];

                    transformCodebase({
                        "srcDirPath": libDirPath,
                        "destDirPath": libDirPath,
                        "transformSourceCode": ({ sourceCode, fileRelativePath }) => {
                            if (fileRelativePath.endsWith(".map")) {
                                return undefined;
                            }

                            if (toDeletePerfixes.find(prefix => fileRelativePath.startsWith(prefix)) !== undefined) {
                                return undefined;
                            }

                            return { "modifiedSourceCode": sourceCode };
                        }
                    });
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

                    // Note, this is an optimization for reducing the size of the jar,
                    // For this version we know exactly which resources are used.
                    {
                        const nodeModulesDirPath = pathJoin(destDirPath, "keycloak", "common", "resources", "node_modules");

                        const toKeepPrefixes = [
                            ...["patternfly.min.css", "patternfly-additions.min.css", "patternfly-additions.min.css"].map(fileBasename =>
                                pathJoin("patternfly", "dist", "css", fileBasename)
                            ),
                            pathJoin("patternfly", "dist", "fonts")
                        ];

                        transformCodebase({
                            "srcDirPath": nodeModulesDirPath,
                            "destDirPath": nodeModulesDirPath,
                            "transformSourceCode": ({ sourceCode, fileRelativePath }) => {
                                if (toKeepPrefixes.find(prefix => fileRelativePath.startsWith(prefix)) === undefined) {
                                    return undefined;
                                }
                                return { "modifiedSourceCode": sourceCode };
                            }
                        });
                    }
                }
            }
        }
    });
}

async function main() {
    const buildOptions = readBuildOptions({
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
