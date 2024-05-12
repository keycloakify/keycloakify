import { assert } from "tsafe/assert";
import type { KeycloakAccountV1Version, KeycloakThemeAdditionalInfoExtensionVersion } from "./extensionVersions";
import { join as pathJoin } from "path";
import { transformCodebase } from "../../tools/transformCodebase";
import type { BuildOptions } from "../buildOptions";
import * as fs from "fs/promises";
import { accountV1ThemeName } from "../../constants";
import { generatePom, BuildOptionsLike as BuildOptionsLike_generatePom } from "./generatePom";
import { existsSync } from "fs";
import { isInside } from "../../tools/isInside";
import child_process from "child_process";

export type BuildOptionsLike = BuildOptionsLike_generatePom & {
    keycloakifyBuildDirPath: string;
    themeNames: string[];
    artifactId: string;
    themeVersion: string;
};

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export async function buildJar(params: {
    jarFileBasename: string;
    keycloakAccountV1Version: KeycloakAccountV1Version;
    keycloakThemeAdditionalInfoExtensionVersion: KeycloakThemeAdditionalInfoExtensionVersion;
    buildOptions: BuildOptionsLike;
}): Promise<void> {
    const { jarFileBasename, keycloakAccountV1Version, keycloakThemeAdditionalInfoExtensionVersion, buildOptions } = params;

    const keycloakifyBuildTmpDirPath = pathJoin(buildOptions.keycloakifyBuildDirPath, "..", jarFileBasename.replace(".jar", ""));

    {
        if (!existsSync(buildOptions.keycloakifyBuildDirPath)) {
            await fs.mkdir(buildOptions.keycloakifyBuildDirPath, { "recursive": true });
        }

        await fs.writeFile(pathJoin(buildOptions.keycloakifyBuildDirPath, ".gitignore"), Buffer.from("*", "utf8"));
    }

    {
        const srcMainResourcesRelativeDirPath = pathJoin("src", "main", "resources");

        const keycloakThemesJsonFilePath = pathJoin(srcMainResourcesRelativeDirPath, "META-INF", "keycloak-themes.json");

        const themePropertiesFilePathSet = new Set(
            ...buildOptions.themeNames.map(themeName => pathJoin(srcMainResourcesRelativeDirPath, "themes", themeName, "account", "theme.properties"))
        );

        const accountV1RelativeDirPath = pathJoin(srcMainResourcesRelativeDirPath, "themes", accountV1ThemeName);

        transformCodebase({
            "srcDirPath": buildOptions.keycloakifyBuildDirPath,
            "destDirPath": keycloakifyBuildTmpDirPath,
            "transformSourceCode":
                keycloakAccountV1Version !== null
                    ? undefined
                    : ({ fileRelativePath, sourceCode }) => {
                          if (fileRelativePath === keycloakThemesJsonFilePath) {
                              const keycloakThemesJsonParsed = JSON.parse(sourceCode.toString("utf8")) as {
                                  themes: { name: string; types: string[] }[];
                              };

                              keycloakThemesJsonParsed.themes = keycloakThemesJsonParsed.themes.filter(({ name }) => name !== accountV1ThemeName);

                              return { "modifiedSourceCode": Buffer.from(JSON.stringify(keycloakThemesJsonParsed, null, 2), "utf8") };
                          }

                          if (isInside({ "dirPath": "target", "filePath": fileRelativePath })) {
                              return undefined;
                          }

                          if (isInside({ "dirPath": accountV1RelativeDirPath, "filePath": fileRelativePath })) {
                              return undefined;
                          }

                          if (themePropertiesFilePathSet.has(fileRelativePath)) {
                              return {
                                  "modifiedSourceCode": Buffer.from(
                                      sourceCode.toString("utf8").replace(`parent=${accountV1ThemeName}`, "parent=keycloak"),
                                      "utf8"
                                  )
                              };
                          }

                          return { "modifiedSourceCode": sourceCode };
                      }
        });
    }

    {
        const { pomFileCode } = generatePom({
            buildOptions,
            keycloakAccountV1Version,
            keycloakThemeAdditionalInfoExtensionVersion
        });

        await fs.writeFile(pathJoin(buildOptions.keycloakifyBuildDirPath, "pom.xml"), Buffer.from(pomFileCode, "utf8"));
    }

    await new Promise<void>((resolve, reject) =>
        child_process.exec("mvn clean install", { "cwd": keycloakifyBuildTmpDirPath }, error => {
            if (error !== null) {
                reject(error);
                return;
            }
            resolve();
        })
    );

    await fs.rename(
        pathJoin(keycloakifyBuildTmpDirPath, "target", `${buildOptions.artifactId}-${buildOptions.themeVersion}.jar`),
        pathJoin(buildOptions.keycloakifyBuildDirPath, jarFileBasename)
    );

    await fs.rm(keycloakifyBuildTmpDirPath, { "recursive": true });
}
