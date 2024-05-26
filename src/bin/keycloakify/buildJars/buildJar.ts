import { assert, type Equals } from "tsafe/assert";
import type {
    KeycloakAccountV1Version,
    KeycloakThemeAdditionalInfoExtensionVersion
} from "./extensionVersions";
import { join as pathJoin, dirname as pathDirname } from "path";
import { transformCodebase } from "../../tools/transformCodebase";
import type { BuildOptions } from "../../shared/buildOptions";
import * as fs from "fs/promises";
import { accountV1ThemeName } from "../../shared/constants";
import {
    generatePom,
    BuildOptionsLike as BuildOptionsLike_generatePom
} from "./generatePom";
import { readFileSync } from "fs";
import { isInside } from "../../tools/isInside";
import child_process from "child_process";
import { rmSync } from "../../tools/fs.rmSync";
import { getMetaInfKeycloakThemesJsonFilePath } from "../../shared/metaInfKeycloakThemes";
import type { Param0 } from "tsafe";

export type BuildOptionsLike = BuildOptionsLike_generatePom & {
    keycloakifyBuildDirPath: string;
    themeNames: string[];
    artifactId: string;
    themeVersion: string;
    cacheDirPath: string;
};

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export async function buildJar(params: {
    jarFileBasename: string;
    keycloakAccountV1Version: KeycloakAccountV1Version;
    keycloakThemeAdditionalInfoExtensionVersion: KeycloakThemeAdditionalInfoExtensionVersion;
    buildOptions: BuildOptionsLike;
}): Promise<void> {
    const {
        jarFileBasename,
        keycloakAccountV1Version,
        keycloakThemeAdditionalInfoExtensionVersion,
        buildOptions
    } = params;

    const keycloakifyBuildTmpDirPath = pathJoin(
        buildOptions.cacheDirPath,
        jarFileBasename.replace(".jar", "")
    );

    rmSync(keycloakifyBuildTmpDirPath, { recursive: true, force: true });

    {
        const metaInfKeycloakThemesJsonRelativePath =
            getMetaInfKeycloakThemesJsonFilePath({
                keycloakifyBuildDirPath: ""
            });

        const { transformCodebase_common } = (() => {
            const includingAccountV1ThemeNames = [
                ...buildOptions.themeNames,
                accountV1ThemeName
            ];

            const transformCodebase_common: Param0<
                typeof transformCodebase
            >["transformSourceCode"] = ({ fileRelativePath, sourceCode }) => {
                if (metaInfKeycloakThemesJsonRelativePath === fileRelativePath) {
                    return { modifiedSourceCode: sourceCode };
                }

                for (const themeName of includingAccountV1ThemeNames) {
                    if (
                        isInside({
                            dirPath: pathJoin(
                                "src",
                                "main",
                                "resources",
                                "theme",
                                themeName
                            ),
                            filePath: fileRelativePath
                        })
                    ) {
                        return { modifiedSourceCode: sourceCode };
                    }
                }

                return undefined;
            };

            return { transformCodebase_common };
        })();

        const { transformCodebase_patchForUsingBuiltinAccountV1 } = (() => {
            if (keycloakAccountV1Version !== null) {
                return {
                    transformCodebase_patchForUsingBuiltinAccountV1: undefined
                };
            }

            const themePropertiesFileRelativePathSet = new Set(
                ...buildOptions.themeNames.map(themeName =>
                    pathJoin(
                        "src",
                        "main",
                        "resources",
                        "theme",
                        themeName,
                        "account",
                        "theme.properties"
                    )
                )
            );

            const accountV1RelativeDirPath = pathJoin(
                "src",
                "main",
                "resources",
                "theme",
                accountV1ThemeName
            );

            const transformCodebase_patchForUsingBuiltinAccountV1: Param0<
                typeof transformCodebase
            >["transformSourceCode"] = ({ fileRelativePath, sourceCode }) => {
                if (
                    isInside({
                        dirPath: accountV1RelativeDirPath,
                        filePath: fileRelativePath
                    })
                ) {
                    return undefined;
                }

                if (fileRelativePath === metaInfKeycloakThemesJsonRelativePath) {
                    const keycloakThemesJsonParsed = JSON.parse(
                        sourceCode.toString("utf8")
                    ) as {
                        themes: { name: string; types: string[] }[];
                    };

                    keycloakThemesJsonParsed.themes =
                        keycloakThemesJsonParsed.themes.filter(
                            ({ name }) => name !== accountV1ThemeName
                        );

                    return {
                        modifiedSourceCode: Buffer.from(
                            JSON.stringify(keycloakThemesJsonParsed, null, 2),
                            "utf8"
                        )
                    };
                }

                if (themePropertiesFileRelativePathSet.has(fileRelativePath)) {
                    const modifiedSourceCode = Buffer.from(
                        sourceCode
                            .toString("utf8")
                            .replace(`parent=${accountV1ThemeName}`, "parent=keycloak"),
                        "utf8"
                    );

                    // assert modifiedSourceCode !== sourceCode
                    assert(Buffer.compare(modifiedSourceCode, sourceCode) !== 0);

                    return { modifiedSourceCode };
                }

                return { modifiedSourceCode: sourceCode };
            };

            return { transformCodebase_patchForUsingBuiltinAccountV1 };
        })();

        transformCodebase({
            srcDirPath: buildOptions.keycloakifyBuildDirPath,
            destDirPath: keycloakifyBuildTmpDirPath,
            transformSourceCode: params => {
                const resultCommon = transformCodebase_common(params);

                if (resultCommon === undefined) {
                    return undefined;
                }

                if (transformCodebase_patchForUsingBuiltinAccountV1 === undefined) {
                    return resultCommon;
                }

                const { modifiedSourceCode, newFileName } = resultCommon;

                assert(newFileName === undefined);

                return transformCodebase_patchForUsingBuiltinAccountV1?.({
                    ...params,
                    sourceCode: modifiedSourceCode
                });
            }
        });
    }

    route_legacy_pages: {
        // NOTE: If there's no account theme there is no special target for keycloak 24 and up so we create
        // the pages anyway. If there is an account pages, since we know that account-v1 is only support keycloak
        // 24 in version 0.4 and up, we can safely break the route for legacy pages.
        const doBreak: boolean = (() => {
            switch (keycloakAccountV1Version) {
                case null:
                    return false;
                case "0.3":
                    return false;
                default:
                    return true;
            }
        })();

        if (doBreak) {
            break route_legacy_pages;
        }

        (["register.ftl", "login-update-profile.ftl"] as const).forEach(pageId =>
            buildOptions.themeNames.map(themeName => {
                const ftlFilePath = pathJoin(
                    keycloakifyBuildTmpDirPath,
                    "src",
                    "main",
                    "resources",
                    "theme",
                    themeName,
                    "login",
                    pageId
                );

                const ftlFileContent = readFileSync(ftlFilePath).toString("utf8");

                const realPageId = (() => {
                    switch (pageId) {
                        case "register.ftl":
                            return "register-user-profile.ftl";
                        case "login-update-profile.ftl":
                            return "update-user-profile.ftl";
                    }
                    assert<Equals<typeof pageId, never>>(false);
                })();

                const modifiedFtlFileContent = ftlFileContent.replace(
                    `out["pageId"] = "\${pageId}";`,
                    `out["pageId"] = "${pageId}"; out["realPageId"] = "${realPageId}";`
                );

                assert(modifiedFtlFileContent !== ftlFileContent);

                fs.writeFile(
                    pathJoin(pathDirname(ftlFilePath), realPageId),
                    Buffer.from(modifiedFtlFileContent, "utf8")
                );
            })
        );
    }

    {
        const { pomFileCode } = generatePom({
            buildOptions,
            keycloakAccountV1Version,
            keycloakThemeAdditionalInfoExtensionVersion
        });

        await fs.writeFile(
            pathJoin(keycloakifyBuildTmpDirPath, "pom.xml"),
            Buffer.from(pomFileCode, "utf8")
        );
    }

    await new Promise<void>((resolve, reject) =>
        child_process.exec(
            `mvn clean install -Dmaven.repo.local=${pathJoin(keycloakifyBuildTmpDirPath, ".m2")}`,
            { cwd: keycloakifyBuildTmpDirPath },
            error => {
                if (error !== null) {
                    console.error(
                        `Build jar failed: ${JSON.stringify(
                            {
                                jarFileBasename,
                                keycloakAccountV1Version,
                                keycloakThemeAdditionalInfoExtensionVersion
                            },
                            null,
                            2
                        )}`
                    );

                    reject(error);
                    return;
                }
                resolve();
            }
        )
    );

    await fs.rename(
        pathJoin(
            keycloakifyBuildTmpDirPath,
            "target",
            `${buildOptions.artifactId}-${buildOptions.themeVersion}.jar`
        ),
        pathJoin(buildOptions.keycloakifyBuildDirPath, jarFileBasename)
    );

    rmSync(keycloakifyBuildTmpDirPath, { recursive: true });
}
