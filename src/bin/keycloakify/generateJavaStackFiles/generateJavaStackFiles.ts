import * as fs from "fs";
import { join as pathJoin, dirname as pathDirname, basename as pathBasename } from "path";
import { assert } from "tsafe/assert";
import { Reflect } from "tsafe/Reflect";
import type { BuildOptions } from "../BuildOptions";
import type { ThemeType } from "../generateFtl";
import { downloadBuiltinKeycloakTheme } from "../../download-builtin-keycloak-theme";
import { transformCodebase } from "../../tools/transformCodebase";

export type BuildOptionsLike = {
    themeName: string;
    extraThemeNames: string[];
    groupId: string;
    artifactId: string;
    themeVersion: string;
};

{
    const buildOptions = Reflect<BuildOptions>();

    assert<typeof buildOptions extends BuildOptionsLike ? true : false>();
}

export const accountV1Keycloak = "account-v1-keycloak";

export async function generateJavaStackFiles(params: {
    keycloakThemeBuildingDirPath: string;
    implementedThemeTypes: Record<ThemeType | "email", boolean>;
    buildOptions: BuildOptionsLike;
}): Promise<{
    jarFilePath: string;
}> {
    const {
        buildOptions: { groupId, themeName, extraThemeNames, themeVersion, artifactId },
        keycloakThemeBuildingDirPath,
        implementedThemeTypes
    } = params;

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
                `	<groupId>${groupId}</groupId>`,
                `	<artifactId>${artifactId}</artifactId>`,
                `	<version>${themeVersion}</version>`,
                `	<name>${artifactId}</name>`,
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

        fs.writeFileSync(pathJoin(keycloakThemeBuildingDirPath, "pom.xml"), Buffer.from(pomFileCode, "utf8"));
    }

    const accountV1 = "account-v1";

    {
        const builtinKeycloakThemeTmpDirPath = pathJoin(keycloakThemeBuildingDirPath, "..", "tmp_yxdE2_builtin_keycloak_theme");

        await downloadBuiltinKeycloakTheme({
            "destDirPath": builtinKeycloakThemeTmpDirPath,
            "isSilent": true,
            "keycloakVersion": "21.1.2"
        });

        transformCodebase({
            "srcDirPath": pathJoin(builtinKeycloakThemeTmpDirPath, "base", "account"),
            "destDirPath": pathJoin(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme", accountV1, "account")
        });

        transformCodebase({
            "srcDirPath": pathJoin(builtinKeycloakThemeTmpDirPath, "keycloak", "common"),
            "destDirPath": pathJoin(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme", accountV1Keycloak, "common")
        });

        transformCodebase({
            "srcDirPath": pathJoin(builtinKeycloakThemeTmpDirPath, "keycloak", "account"),
            "destDirPath": pathJoin(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme", accountV1Keycloak, "account"),
            "transformSourceCode": ({ sourceCode, filePath }) => {
                if (pathBasename(filePath) !== "theme.properties") {
                    sourceCode = Buffer.from(sourceCode.toString("utf8").replace("parent=base", `parent=${accountV1}`), "utf8");
                    sourceCode = Buffer.from(
                        sourceCode.toString("utf8").replace("import=common/keycloak", `import=common/${accountV1Keycloak}`),
                        "utf8"
                    );
                }

                return {
                    "modifiedSourceCode": sourceCode
                };
            }
        });

        fs.rmdirSync(builtinKeycloakThemeTmpDirPath, { "recursive": true });
    }

    transformCodebase({
        "srcDirPath": pathJoin(__dirname, "account-v1-java"),
        "destDirPath": pathJoin(keycloakThemeBuildingDirPath, "src", "main", "java", "org", "keycloak")
    });

    {
        const themeManifestFilePath = pathJoin(keycloakThemeBuildingDirPath, "src", "main", "resources", "META-INF", "keycloak-themes.json");

        try {
            fs.mkdirSync(pathDirname(themeManifestFilePath));
        } catch {}

        fs.writeFileSync(
            themeManifestFilePath,
            Buffer.from(
                JSON.stringify(
                    {
                        "themes": [
                            {
                                "name": "account-v1",
                                "types": ["account"]
                            },
                            {
                                "name": "account-v1-keycloak",
                                "types": ["account"]
                            },
                            ...[themeName, ...extraThemeNames].map(themeName => ({
                                "name": themeName,
                                "types": Object.entries(implementedThemeTypes)
                                    .filter(([, isImplemented]) => isImplemented)
                                    .map(([themeType]) => themeType)
                            }))
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
        "jarFilePath": pathJoin(keycloakThemeBuildingDirPath, "target", `${artifactId}-${themeVersion}.jar`)
    };
}
