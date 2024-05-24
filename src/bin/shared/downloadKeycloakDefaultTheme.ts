import { join as pathJoin, relative as pathRelative } from "path";
import { type BuildOptions } from "./buildOptions";
import { assert } from "tsafe/assert";
import { lastKeycloakVersionWithAccountV1 } from "./constants";
import { downloadAndExtractArchive } from "../tools/downloadAndExtractArchive";
import { isInside } from "../tools/isInside";

export type BuildOptionsLike = {
    cacheDirPath: string;
    npmWorkspaceRootDirPath: string;
};

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export async function downloadKeycloakDefaultTheme(params: {
    keycloakVersion: string;
    buildOptions: BuildOptionsLike;
}): Promise<{ defaultThemeDirPath: string }> {
    const { keycloakVersion, buildOptions } = params;

    const { extractedDirPath } = await downloadAndExtractArchive({
        url: `https://repo1.maven.org/maven2/org/keycloak/keycloak-themes/${keycloakVersion}/keycloak-themes-${keycloakVersion}.jar`,
        cacheDirPath: buildOptions.cacheDirPath,
        npmWorkspaceRootDirPath: buildOptions.npmWorkspaceRootDirPath,
        uniqueIdOfOnOnArchiveFile: "downloadKeycloakDefaultTheme",
        onArchiveFile: async params => {
            if (!isInside({ dirPath: "theme", filePath: params.fileRelativePath })) {
                return;
            }

            const { readFile, writeFile } = params;

            const fileRelativePath = pathRelative("theme", params.fileRelativePath);

            skip_keycloak_v2: {
                if (
                    !isInside({
                        dirPath: pathJoin("keycloak.v2"),
                        filePath: fileRelativePath
                    })
                ) {
                    break skip_keycloak_v2;
                }

                return;
            }

            last_account_v1_transformations: {
                if (lastKeycloakVersionWithAccountV1 !== keycloakVersion) {
                    break last_account_v1_transformations;
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

                skip_unused_node_modules: {
                    const dirPath = pathJoin(
                        "keycloak",
                        "common",
                        "resources",
                        "node_modules"
                    );

                    if (!isInside({ dirPath, filePath: fileRelativePath })) {
                        break skip_unused_node_modules;
                    }

                    const toKeepPrefixes = [
                        ...[
                            "patternfly.min.css",
                            "patternfly-additions.min.css",
                            "patternfly-additions.min.css"
                        ].map(fileBasename =>
                            pathJoin(dirPath, "patternfly", "dist", "css", fileBasename)
                        ),
                        pathJoin(dirPath, "patternfly", "dist", "fonts")
                    ];

                    if (
                        toKeepPrefixes.find(prefix =>
                            fileRelativePath.startsWith(prefix)
                        ) !== undefined
                    ) {
                        break skip_unused_node_modules;
                    }

                    return;
                }
            }

            await writeFile({ fileRelativePath });
        }
    });

    return { defaultThemeDirPath: extractedDirPath };
}
