import { assert } from "tsafe/assert";
import { Reflect } from "tsafe/Reflect";
import type { BuildOptions } from "./buildOptions";

type BuildOptionsLike = {
    groupId: string;
    artifactId: string;
    themeVersion: string;
    keycloakifyBuildDirPath: string;
};

{
    const buildOptions = Reflect<BuildOptions>();

    assert<typeof buildOptions extends BuildOptionsLike ? true : false>();
}

export function generatePom(params: { buildOptions: BuildOptionsLike }) {
    const { buildOptions } = params;

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

    return { pomFileCode };
}
