import * as fs from "fs";
import { join as pathJoin, dirname as pathDirname } from "path";
import { assert } from "tsafe/assert";
import { Reflect } from "tsafe/Reflect";
import type { BuildOptions } from "../buildOptions";
import { type ThemeType, accountV1ThemeName } from "../../constants";
import { bringInAccountV1 } from "./bringInAccountV1";

export type BuildOptionsLike = {
    groupId: string;
    artifactId: string;
    themeVersion: string;
    cacheDirPath: string;
    keycloakifyBuildDirPath: string;
    themeNames: string[];
};

{
    const buildOptions = Reflect<BuildOptions>();

    assert<typeof buildOptions extends BuildOptionsLike ? true : false>();
}

export async function generateJavaStackFiles(params: {
    implementedThemeTypes: Record<ThemeType | "email", boolean>;
    buildOptions: BuildOptionsLike;
}): Promise<{
    jarFilePath: string;
}> {
    const { implementedThemeTypes, buildOptions } = params;

    {
        const { pomFileCode } = (function generatePomFileCode(): {
            pomFileCode: string;
        } {
            const pomFileCode = [
                `<?xml version="1.0"?>`,
                `<project xmlns="http://maven.apache.org/POM/4.0.0"`,
                `	 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`,
                `	 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">`,
                `  <modelVersion>4.0.0</modelVersion>`,
                `	<groupId>${buildOptions.groupId}</groupId>`,
                `	<artifactId>${buildOptions.artifactId}</artifactId>`,
                `	<version>${buildOptions.themeVersion}</version>`,
                `	<name>${buildOptions.artifactId}</name>`,
                `  <description />`,
                `  <packaging>jar</packaging>`,
                `  <properties>`,
                `    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>`,
                `  </properties>`,
                `  <build>`,
                `    <plugins>`,
                `      <plugin>`,
                `        <groupId>org.apache.maven.plugins</groupId>`,
                `        <artifactId>maven-shade-plugin</artifactId>`,
                `	<version>3.5.1</version>`,
                `        <executions>`,
                `          <execution>`,
                `            <phase>package</phase>`,
                `            <goals>`,
                `              <goal>shade</goal>`,
                `            </goals>`,
                `          </execution>`,
                `        </executions>`,
                `      </plugin>`,
                `    </plugins>`,
                `  </build>`,
                `  <dependencies>`,
                `    <dependency>`,
                `      <groupId>io.phasetwo.keycloak</groupId>`,
                `      <artifactId>keycloak-account-v1</artifactId>`,
                `      <version>0.1</version>`,
                `    </dependency>`,
                `  </dependencies>`,
                `</project>`
            ].join("\n");

            return { pomFileCode };
        })();

        fs.writeFileSync(pathJoin(buildOptions.keycloakifyBuildDirPath, "pom.xml"), Buffer.from(pomFileCode, "utf8"));
    }

    if (implementedThemeTypes.account) {
        await bringInAccountV1({ buildOptions });
    }

    {
        const themeManifestFilePath = pathJoin(buildOptions.keycloakifyBuildDirPath, "src", "main", "resources", "META-INF", "keycloak-themes.json");

        try {
            fs.mkdirSync(pathDirname(themeManifestFilePath));
        } catch {}

        fs.writeFileSync(
            themeManifestFilePath,
            Buffer.from(
                JSON.stringify(
                    {
                        "themes": [
                            ...(!implementedThemeTypes.account
                                ? []
                                : [
                                      {
                                          "name": accountV1ThemeName,
                                          "types": ["account"]
                                      }
                                  ]),
                            ...buildOptions.themeNames
                                .map(themeName => [
                                    {
                                        "name": themeName,
                                        "types": Object.entries(implementedThemeTypes)
                                            .filter(([, isImplemented]) => isImplemented)
                                            .map(([themeType]) => themeType)
                                    }
                                ])
                                .flat()
                        ]
                    },
                    null,
                    2
                ),
                "utf8"
            )
        );
    }

    return {
        "jarFilePath": pathJoin(buildOptions.keycloakifyBuildDirPath, "target", `${buildOptions.artifactId}-${buildOptions.themeVersion}.jar`)
    };
}
