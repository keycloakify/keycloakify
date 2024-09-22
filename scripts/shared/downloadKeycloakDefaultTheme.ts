import { relative as pathRelative } from "path";
import { downloadAndExtractArchive } from "../../src/bin/tools/downloadAndExtractArchive";
import { getProxyFetchOptions } from "../../src/bin/tools/fetchProxyOptions";
import { join as pathJoin } from "path";
import { assert, type Equals } from "tsafe/assert";
import { cacheDirPath } from "./cacheDirPath";
import { getThisCodebaseRootDirPath } from "../../src/bin/tools/getThisCodebaseRootDirPath";

const KEYCLOAK_VERSION = {
    FOR_LOGIN_THEME: "25.0.4",
    FOR_ACCOUNT_MULTI_PAGE: "21.1.2"
} as const;

export async function downloadKeycloakDefaultTheme(params: {
    keycloakVersionId: keyof typeof KEYCLOAK_VERSION;
}) {
    const { keycloakVersionId } = params;

    const keycloakVersion = KEYCLOAK_VERSION[keycloakVersionId];

    let kcNodeModulesKeepFilePaths: Set<string> | undefined = undefined;
    let kcNodeModulesKeepFilePaths_lastAccountV1: Set<string> | undefined = undefined;

    const { extractedDirPath } = await downloadAndExtractArchive({
        url: `https://repo1.maven.org/maven2/org/keycloak/keycloak-themes/${keycloakVersion}/keycloak-themes-${keycloakVersion}.jar`,
        cacheDirPath,
        fetchOptions: getProxyFetchOptions({
            npmConfigGetCwd: getThisCodebaseRootDirPath()
        }),
        uniqueIdOfOnArchiveFile: "extractOnlyRequiredFiles",
        onArchiveFile: async params => {
            const fileRelativePath = pathRelative("theme", params.fileRelativePath);

            if (fileRelativePath.startsWith("..")) {
                return;
            }

            const { readFile, writeFile } = params;

            if (
                !fileRelativePath.startsWith("base") &&
                !fileRelativePath.startsWith("keycloak")
            ) {
                return;
            }

            switch (keycloakVersion) {
                case KEYCLOAK_VERSION.FOR_LOGIN_THEME:
                    if (
                        !fileRelativePath.startsWith(pathJoin("base", "login")) &&
                        !fileRelativePath.startsWith(pathJoin("keycloak", "login")) &&
                        !fileRelativePath.startsWith(pathJoin("keycloak", "common"))
                    ) {
                        return;
                    }

                    if (fileRelativePath.endsWith(".ftl")) {
                        return;
                    }

                    break;
                case KEYCLOAK_VERSION.FOR_ACCOUNT_MULTI_PAGE:
                    if (
                        !fileRelativePath.startsWith(pathJoin("base", "account")) &&
                        !fileRelativePath.startsWith(pathJoin("keycloak", "account")) &&
                        !fileRelativePath.startsWith(pathJoin("keycloak", "common"))
                    ) {
                        return;
                    }

                    break;
                default:
                    assert<Equals<typeof keycloakVersion, never>>(false);
            }

            last_account_v1_transformations: {
                if (keycloakVersion !== KEYCLOAK_VERSION.FOR_ACCOUNT_MULTI_PAGE) {
                    break last_account_v1_transformations;
                }

                skip_web_modules: {
                    if (
                        !fileRelativePath.startsWith(
                            pathJoin("keycloak", "common", "resources", "web_modules")
                        )
                    ) {
                        break skip_web_modules;
                    }

                    return;
                }

                skip_lib: {
                    if (
                        !fileRelativePath.startsWith(
                            pathJoin("keycloak", "common", "resources", "lib")
                        )
                    ) {
                        break skip_lib;
                    }

                    return;
                }

                skip_node_modules: {
                    const nodeModulesRelativeDirPath = pathJoin(
                        "keycloak",
                        "common",
                        "resources",
                        "node_modules"
                    );

                    if (!fileRelativePath.startsWith(nodeModulesRelativeDirPath)) {
                        break skip_node_modules;
                    }

                    if (kcNodeModulesKeepFilePaths_lastAccountV1 === undefined) {
                        kcNodeModulesKeepFilePaths_lastAccountV1 = new Set([
                            pathJoin("patternfly", "dist", "css", "patternfly.min.css"),
                            pathJoin(
                                "patternfly",
                                "dist",
                                "css",
                                "patternfly-additions.min.css"
                            ),
                            pathJoin(
                                "patternfly",
                                "dist",
                                "fonts",
                                "OpenSans-Regular-webfont.woff2"
                            ),
                            pathJoin(
                                "patternfly",
                                "dist",
                                "fonts",
                                "OpenSans-Bold-webfont.woff2"
                            ),
                            pathJoin(
                                "patternfly",
                                "dist",
                                "fonts",
                                "OpenSans-Light-webfont.woff2"
                            ),
                            pathJoin(
                                "patternfly",
                                "dist",
                                "fonts",
                                "OpenSans-Semibold-webfont.woff2"
                            ),
                            pathJoin(
                                "patternfly",
                                "dist",
                                "fonts",
                                "PatternFlyIcons-webfont.ttf"
                            ),
                            pathJoin(
                                "patternfly",
                                "dist",
                                "fonts",
                                "PatternFlyIcons-webfont.woff"
                            )
                        ]);
                    }

                    const fileRelativeToNodeModulesPath = fileRelativePath.substring(
                        nodeModulesRelativeDirPath.length + 1
                    );

                    if (
                        kcNodeModulesKeepFilePaths_lastAccountV1.has(
                            fileRelativeToNodeModulesPath
                        )
                    ) {
                        break skip_node_modules;
                    }

                    return;
                }

                patch_account_css: {
                    if (
                        fileRelativePath !==
                        pathJoin("keycloak", "account", "resources", "css", "account.css")
                    ) {
                        break patch_account_css;
                    }

                    await writeFile({
                        fileRelativePath,
                        modifiedData: Buffer.from(
                            (await readFile())
                                .toString("utf8")
                                .replace("top: -34px;", "top: -34px !important;"),
                            "utf8"
                        )
                    });

                    return;
                }
            }

            skip_unused_resources: {
                if (keycloakVersion !== KEYCLOAK_VERSION.FOR_LOGIN_THEME) {
                    break skip_unused_resources;
                }

                skip_node_modules: {
                    const nodeModulesRelativeDirPath = pathJoin(
                        "keycloak",
                        "common",
                        "resources",
                        "node_modules"
                    );

                    if (!fileRelativePath.startsWith(nodeModulesRelativeDirPath)) {
                        break skip_node_modules;
                    }

                    if (kcNodeModulesKeepFilePaths === undefined) {
                        kcNodeModulesKeepFilePaths = new Set([
                            pathJoin("@patternfly", "patternfly", "patternfly.min.css"),
                            pathJoin("patternfly", "dist", "css", "patternfly.min.css"),
                            pathJoin(
                                "patternfly",
                                "dist",
                                "css",
                                "patternfly-additions.min.css"
                            ),
                            pathJoin(
                                "patternfly",
                                "dist",
                                "fonts",
                                "OpenSans-Regular-webfont.woff2"
                            ),
                            pathJoin(
                                "patternfly",
                                "dist",
                                "fonts",
                                "OpenSans-Light-webfont.woff2"
                            ),
                            pathJoin(
                                "patternfly",
                                "dist",
                                "fonts",
                                "OpenSans-Bold-webfont.woff2"
                            ),
                            pathJoin(
                                "patternfly",
                                "dist",
                                "fonts",
                                "OpenSans-Bold-webfont.woff"
                            ),
                            pathJoin(
                                "patternfly",
                                "dist",
                                "fonts",
                                "OpenSans-Bold-webfont.ttf"
                            ),
                            pathJoin(
                                "patternfly",
                                "dist",
                                "fonts",
                                "fontawesome-webfont.woff2"
                            ),
                            pathJoin(
                                "patternfly",
                                "dist",
                                "fonts",
                                "PatternFlyIcons-webfont.ttf"
                            ),
                            pathJoin(
                                "patternfly",
                                "dist",
                                "fonts",
                                "PatternFlyIcons-webfont.woff"
                            ),
                            pathJoin(
                                "patternfly",
                                "dist",
                                "fonts",
                                "OpenSans-Semibold-webfont.woff2"
                            ),
                            pathJoin("patternfly", "dist", "img", "bg-login.jpg"),
                            pathJoin("jquery", "dist", "jquery.min.js"),
                            pathJoin("rfc4648", "lib", "rfc4648.js")
                        ]);
                    }

                    const fileRelativeToNodeModulesPath = fileRelativePath.substring(
                        nodeModulesRelativeDirPath.length + 1
                    );

                    if (kcNodeModulesKeepFilePaths.has(fileRelativeToNodeModulesPath)) {
                        break skip_node_modules;
                    }

                    return;
                }

                skip_vendor: {
                    if (
                        !fileRelativePath.startsWith(
                            pathJoin("keycloak", "common", "resources", "vendor")
                        )
                    ) {
                        break skip_vendor;
                    }

                    return;
                }

                skip_rollup_config: {
                    if (
                        fileRelativePath !==
                        pathJoin("keycloak", "common", "resources", "rollup.config.js")
                    ) {
                        break skip_rollup_config;
                    }

                    return;
                }

                skip_package_json: {
                    if (
                        fileRelativePath !==
                        pathJoin("keycloak", "common", "resources", "package.json")
                    ) {
                        break skip_package_json;
                    }
                    return;
                }
            }

            await writeFile({ fileRelativePath });
        }
    });

    return { extractedDirPath };
}
