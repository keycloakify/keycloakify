import { assert } from "tsafe/assert";
import type { BuildContext } from "../../shared/buildContext";
import type {
    KeycloakAccountV1Version,
    KeycloakThemeAdditionalInfoExtensionVersion
} from "./extensionVersions";

export type BuildContextLike = {
    groupId: string;
    artifactId: string;
    themeVersion: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export function generatePom(params: {
    keycloakAccountV1Version: KeycloakAccountV1Version;
    keycloakThemeAdditionalInfoExtensionVersion: KeycloakThemeAdditionalInfoExtensionVersion;
    buildContext: BuildContextLike;
}) {
    const {
        keycloakAccountV1Version,
        keycloakThemeAdditionalInfoExtensionVersion,
        buildContext
    } = params;

    const { pomFileCode } = (function generatePomFileCode(): {
        pomFileCode: string;
    } {
        const pomFileCode = [
            `<?xml version="1.0"?>`,
            `<project xmlns="http://maven.apache.org/POM/4.0.0"`,
            `	 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`,
            `	 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">`,
            `  <modelVersion>4.0.0</modelVersion>`,
            `	<groupId>${buildContext.groupId}</groupId>`,
            `	<artifactId>${buildContext.artifactId}</artifactId>`,
            `	<version>${buildContext.themeVersion}</version>`,
            `	<name>${buildContext.artifactId}</name>`,
            `  <description />`,
            `  <packaging>jar</packaging>`,
            `  <properties>`,
            `    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>`,
            `  </properties>`,
            ...(keycloakAccountV1Version !== null ||
            keycloakThemeAdditionalInfoExtensionVersion !== null
                ? [
                      `  <build>`,
                      `    <plugins>`,
                      `      <plugin>`,
                      `        <groupId>org.apache.maven.plugins</groupId>`,
                      `        <artifactId>maven-shade-plugin</artifactId>`,
                      `	     <version>3.5.1</version>`,
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
                      ...(keycloakAccountV1Version !== null
                          ? [
                                `    <dependency>`,
                                `      <groupId>io.phasetwo.keycloak</groupId>`,
                                `      <artifactId>keycloak-account-v1</artifactId>`,
                                `      <version>${keycloakAccountV1Version}</version>`,
                                `    </dependency>`
                            ]
                          : []),
                      ...(keycloakThemeAdditionalInfoExtensionVersion !== null
                          ? [
                                `    <dependency>`,
                                `      <groupId>dev.jcputney</groupId>`,
                                `      <artifactId>keycloak-theme-additional-info-extension</artifactId>`,
                                `      <version>${keycloakThemeAdditionalInfoExtensionVersion}</version>`,
                                `    </dependency>`
                            ]
                          : []),
                      `  </dependencies>`
                  ]
                : []),
            `</project>`
        ].join("\n");

        return { pomFileCode };
    })();

    return { pomFileCode };
}
