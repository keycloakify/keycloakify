import { assert, type Equals } from "tsafe/assert";
import type {
    KeycloakAccountV1Version,
    KeycloakThemeAdditionalInfoExtensionVersion
} from "./extensionVersions";
import { join as pathJoin, dirname as pathDirname } from "path";
import { transformCodebase } from "../../tools/transformCodebase";
import type { BuildContext } from "../../shared/buildContext";
import * as fs from "fs/promises";
import {
    generatePom,
    BuildContextLike as BuildContextLike_generatePom
} from "./generatePom";
import { readFileSync } from "fs";
import { isInside } from "../../tools/isInside";
import child_process from "child_process";
import { rmSync } from "../../tools/fs.rmSync";
import { writeMetaInfKeycloakThemes } from "../../shared/metaInfKeycloakThemes";

export type BuildContextLike = BuildContextLike_generatePom & {
    keycloakifyBuildDirPath: string;
    themeNames: string[];
    artifactId: string;
    themeVersion: string;
    cacheDirPath: string;
    implementedThemeTypes: BuildContext["implementedThemeTypes"];
};

assert<BuildContext extends BuildContextLike ? true : false>();

export async function buildJar(params: {
    jarFileBasename: string;
    keycloakAccountV1Version: KeycloakAccountV1Version;
    keycloakThemeAdditionalInfoExtensionVersion: KeycloakThemeAdditionalInfoExtensionVersion;
    resourcesDirPath: string;
    doesImplementAccountV1Theme: boolean;
    buildContext: BuildContextLike;
}): Promise<void> {
    const {
        jarFileBasename,
        keycloakAccountV1Version,
        keycloakThemeAdditionalInfoExtensionVersion,
        resourcesDirPath,
        doesImplementAccountV1Theme,
        buildContext
    } = params;

    const keycloakifyBuildCacheDirPath = pathJoin(
        buildContext.cacheDirPath,
        "maven",
        jarFileBasename.replace(".jar", "")
    );

    const tmpResourcesDirPath = pathJoin(
        keycloakifyBuildCacheDirPath,
        "src",
        "main",
        "resources"
    );

    rmSync(tmpResourcesDirPath, { recursive: true, force: true });

    transformCodebase({
        srcDirPath: resourcesDirPath,
        destDirPath: tmpResourcesDirPath,
        transformSourceCode:
            !doesImplementAccountV1Theme || keycloakAccountV1Version !== null
                ? undefined
                : (params: {
                      fileRelativePath: string;
                      sourceCode: Buffer;
                  }): { modifiedSourceCode: Buffer } | undefined => {
                      const { fileRelativePath, sourceCode } = params;

                      if (
                          isInside({
                              dirPath: pathJoin("theme", "account-v1"),
                              filePath: fileRelativePath
                          })
                      ) {
                          return undefined;
                      }

                      for (const themeName of buildContext.themeNames) {
                          if (
                              fileRelativePath ===
                              pathJoin("theme", themeName, "account", "theme.properties")
                          ) {
                              const modifiedSourceCode = Buffer.from(
                                  sourceCode
                                      .toString("utf8")
                                      .replace(`parent=account-v1`, "parent=keycloak"),
                                  "utf8"
                              );

                              assert(
                                  Buffer.compare(modifiedSourceCode, sourceCode) !== 0
                              );

                              return { modifiedSourceCode };
                          }
                      }

                      return { modifiedSourceCode: sourceCode };
                  }
    });

    remove_account_v1_in_meta_inf: {
        if (!doesImplementAccountV1Theme) {
            // NOTE: We do not have account v1 anyway
            break remove_account_v1_in_meta_inf;
        }

        if (keycloakAccountV1Version !== null) {
            // NOTE: No, we need to keep account-v1 in meta-inf
            break remove_account_v1_in_meta_inf;
        }

        writeMetaInfKeycloakThemes({
            resourcesDirPath: tmpResourcesDirPath,
            getNewMetaInfKeycloakTheme: ({ metaInfKeycloakTheme }) => {
                assert(metaInfKeycloakTheme !== undefined);

                metaInfKeycloakTheme.themes = metaInfKeycloakTheme.themes.filter(
                    ({ name }) => name !== "account-v1"
                );

                return metaInfKeycloakTheme;
            }
        });
    }

    route_legacy_pages: {
        if (!buildContext.implementedThemeTypes.login.isImplemented) {
            break route_legacy_pages;
        }

        (["register.ftl", "login-update-profile.ftl"] as const).forEach(pageId =>
            buildContext.themeNames.map(themeName => {
                const ftlFilePath = pathJoin(
                    tmpResourcesDirPath,
                    "theme",
                    themeName,
                    "login",
                    pageId
                );

                const ftlFileContent = readFileSync(ftlFilePath).toString("utf8");

                const ftlFileBasename = (() => {
                    switch (pageId) {
                        case "register.ftl":
                            return "register-user-profile.ftl";
                        case "login-update-profile.ftl":
                            return "update-user-profile.ftl";
                    }
                    assert<Equals<typeof pageId, never>>(false);
                })();

                const modifiedFtlFileContent = ftlFileContent.replace(
                    `"ftlTemplateFileName": "${pageId}"`,
                    `"ftlTemplateFileName": "${ftlFileBasename}"`
                );

                assert(modifiedFtlFileContent !== ftlFileContent);

                fs.writeFile(
                    pathJoin(pathDirname(ftlFilePath), ftlFileBasename),
                    Buffer.from(modifiedFtlFileContent, "utf8")
                );
            })
        );
    }

    {
        const { pomFileCode } = generatePom({
            buildContext,
            keycloakAccountV1Version,
            keycloakThemeAdditionalInfoExtensionVersion
        });

        await fs.writeFile(
            pathJoin(keycloakifyBuildCacheDirPath, "pom.xml"),
            Buffer.from(pomFileCode, "utf8")
        );
    }

    await new Promise<void>((resolve, reject) =>
        child_process.exec(
            `mvn install -Dmaven.repo.local="${pathJoin(keycloakifyBuildCacheDirPath, ".m2")}"`,
            { cwd: keycloakifyBuildCacheDirPath },
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
            keycloakifyBuildCacheDirPath,
            "target",
            `${buildContext.artifactId}-${buildContext.themeVersion}.jar`
        ),
        pathJoin(buildContext.keycloakifyBuildDirPath, jarFileBasename)
    );
}
