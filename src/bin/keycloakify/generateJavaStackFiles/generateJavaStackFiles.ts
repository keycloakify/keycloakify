import * as fs from "fs";
import { join as pathJoin, dirname as pathDirname } from "path";
import { assert } from "tsafe/assert";
import { Reflect } from "tsafe/Reflect";
import type { BuildOptions } from "../BuildOptions";
import { type ThemeType } from "../../constants";
import { bringInAccountV1, accountV1 } from "./bringInAccountV1";

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
                `	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`,
                `	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">`,
                `	<modelVersion>4.0.0</modelVersion>`,
                `	<groupId>${buildOptions.groupId}</groupId>`,
                `	<artifactId>${buildOptions.artifactId}</artifactId>`,
                `	<version>${buildOptions.themeVersion}</version>`,
                `	<name>${buildOptions.artifactId}</name>`,
                `	<description />`,
                `	<packaging>jar</packaging>`,
                `	<properties>`,
                `	    <java.version>17</java.version>`,
                `	    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>`,
                `	    <keycloak.version>999.0.0-SNAPSHOT</keycloak.version>`,
                `	    <guava.version>32.0.0-jre</guava.version>`,
                `	    <lombok.version>1.18.28</lombok.version>`,
                `	    <auto-service.version>1.1.1</auto-service.version>`,
                `	</properties>`,
                `	<build>`,
                `	    <plugins>`,
                `	        <plugin>`,
                `	            <artifactId>maven-compiler-plugin</artifactId>`,
                `	            <version>3.11.0</version>`,
                `	            <configuration>`,
                `	                <source>\${java.version}</source>`,
                `	                <target>\${java.version}</target>`,
                `	                <compilerArgument>-Xlint:unchecked</compilerArgument>`,
                `	                <compilerArgument>-Xlint:deprecation</compilerArgument>`,
                `	                <useIncrementalCompilation>false</useIncrementalCompilation>`,
                `	                <annotationProcessorPaths>`,
                `	                    <path>`,
                `	                        <groupId>com.google.auto.service</groupId>`,
                `	                        <artifactId>auto-service</artifactId>`,
                `	                        <version>\${auto-service.version}</version>`,
                `	                    </path>`,
                `	                    <path>`,
                `	                        <groupId>org.projectlombok</groupId>`,
                `	                        <artifactId>lombok</artifactId>`,
                `	                        <version>\${lombok.version}</version>`,
                `	                    </path>`,
                `	                </annotationProcessorPaths>`,
                `	            </configuration>`,
                `	        </plugin>`,
                `	        <plugin>`,
                `	            <groupId>org.apache.maven.plugins</groupId>`,
                `	            <artifactId>maven-jar-plugin</artifactId>`,
                `	            <version>3.2.0</version>`,
                `	            <configuration>`,
                `	                <archive>`,
                `	                    <manifestEntries>`,
                `	                        <Dependencies>`,
                `	                            <![CDATA[org.keycloak.keycloak-common,org.keycloak.keycloak-core,org.keycloak.keycloak-server-spi,org.keycloak.keycloak-server-spi-private,org.keycloak.keycloak-services,com.google.guava]]>`,
                `	                        </Dependencies>`,
                `	                    </manifestEntries>`,
                `	                </archive>`,
                `	            </configuration>`,
                `	        </plugin>`,
                `	        <plugin>`,
                `	            <groupId>com.spotify.fmt</groupId>`,
                `	            <artifactId>fmt-maven-plugin</artifactId>`,
                `	            <version>2.20</version>`,
                `	        </plugin>`,
                `	    </plugins>`,
                `	</build>`,
                `	<dependencies>`,
                `	    <dependency>`,
                `	        <groupId>org.projectlombok</groupId>`,
                `	        <artifactId>lombok</artifactId>`,
                `	        <version>\${lombok.version}</version>`,
                `	        <scope>provided</scope>`,
                `	    </dependency>`,
                `	    <dependency>`,
                `	        <groupId>com.google.auto.service</groupId>`,
                `	        <artifactId>auto-service</artifactId>`,
                `	        <version>\${auto-service.version}</version>`,
                `	        <scope>provided</scope>`,
                `	    </dependency>`,
                `	    <dependency>`,
                `	        <groupId>org.keycloak</groupId>`,
                `	        <artifactId>keycloak-server-spi</artifactId>`,
                `	        <version>\${keycloak.version}</version>`,
                `	        <scope>provided</scope>`,
                `	    </dependency>`,
                `	    <dependency>`,
                `	        <groupId>org.keycloak</groupId>`,
                `	        <artifactId>keycloak-server-spi-private</artifactId>`,
                `	        <version>\${keycloak.version}</version>`,
                `	        <scope>provided</scope>`,
                `	    </dependency>`,
                `	    <dependency>`,
                `	        <groupId>org.keycloak</groupId>`,
                `	        <artifactId>keycloak-services</artifactId>`,
                `	        <version>\${keycloak.version}</version>`,
                `	        <scope>provided</scope>`,
                `	    </dependency>`,
                `	    <dependency>`,
                `	        <groupId>jakarta.ws.rs</groupId>`,
                `	        <artifactId>jakarta.ws.rs-api</artifactId>`,
                `	        <version>3.1.0</version>`,
                `	        <scope>provided</scope>`,
                `	    </dependency>`,
                `	    <dependency>`,
                `	        <groupId>com.google.guava</groupId>`,
                `	        <artifactId>guava</artifactId>`,
                `	        <version>\${guava.version}</version>`,
                `	        <scope>provided</scope>`,
                `	    </dependency>`,
                `	</dependencies>`,
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
                                          "name": accountV1,
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
                                    },
                                    ...(!implementedThemeTypes.account
                                        ? []
                                        : [
                                              {
                                                  "name": `${themeName}_retrocompat`,
                                                  "types": ["account"]
                                              }
                                          ])
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
