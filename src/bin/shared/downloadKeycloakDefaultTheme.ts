import { join as pathJoin, relative as pathRelative } from "path";
import { type BuildContext } from "./buildContext";
import { assert } from "tsafe/assert";
import { lastKeycloakVersionWithAccountV1 } from "./constants";
import { downloadAndExtractArchive } from "../tools/downloadAndExtractArchive";

export type BuildContextLike = {
    cacheDirPath: string;
    npmWorkspaceRootDirPath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export async function downloadKeycloakDefaultTheme(params: {
    keycloakVersion: string;
    buildContext: BuildContextLike;
}): Promise<{ defaultThemeDirPath: string }> {
    const { keycloakVersion, buildContext } = params;

    let kcNodeModulesKeepFilePaths: string[] | undefined = undefined;
    let kcNodeModulesKeepFilePaths_lastAccountV1: string[] | undefined = undefined;

    const { extractedDirPath } = await downloadAndExtractArchive({
        url: `https://repo1.maven.org/maven2/org/keycloak/keycloak-themes/${keycloakVersion}/keycloak-themes-${keycloakVersion}.jar`,
        cacheDirPath: buildContext.cacheDirPath,
        npmWorkspaceRootDirPath: buildContext.npmWorkspaceRootDirPath,
        uniqueIdOfOnOnArchiveFile: "downloadKeycloakDefaultTheme",
        onArchiveFile: async params => {
            const fileRelativePath = pathRelative("theme", params.fileRelativePath);

            if (fileRelativePath.startsWith("..")) {
                return;
            }

            const { readFile, writeFile } = params;

            skip_keycloak_v2: {
                if (!fileRelativePath.startsWith(pathJoin("keycloak.v2"))) {
                    break skip_keycloak_v2;
                }

                return;
            }

            last_account_v1_transformations: {
                if (lastKeycloakVersionWithAccountV1 !== keycloakVersion) {
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
                    if (
                        !fileRelativePath.startsWith(
                            pathJoin("keycloak", "common", "resources", "node_modules")
                        )
                    ) {
                        break skip_node_modules;
                    }

                    if (kcNodeModulesKeepFilePaths_lastAccountV1 === undefined) {
                        kcNodeModulesKeepFilePaths_lastAccountV1 = [
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
                            )
                        ];
                    }

                    for (const keepPath of kcNodeModulesKeepFilePaths_lastAccountV1) {
                        if (fileRelativePath.endsWith(keepPath)) {
                            break skip_node_modules;
                        }
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
                if (keycloakVersion !== "24.0.4") {
                    break skip_unused_resources;
                }

                skip_node_modules: {
                    if (
                        !fileRelativePath.startsWith(
                            pathJoin("keycloak", "common", "resources", "node_modules")
                        )
                    ) {
                        break skip_node_modules;
                    }

                    if (kcNodeModulesKeepFilePaths === undefined) {
                        kcNodeModulesKeepFilePaths = [
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
                            pathJoin("jquery", "dist", "jquery.min.js")
                        ];
                    }

                    for (const keepPath of kcNodeModulesKeepFilePaths) {
                        if (fileRelativePath.endsWith(keepPath)) {
                            break skip_node_modules;
                        }
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
            }

            await writeFile({ fileRelativePath });
        }
    });

    return { defaultThemeDirPath: extractedDirPath };
}
