import * as fs from "fs";
import { join as pathJoin, dirname as pathDirname } from "path";
import { assert } from "tsafe/assert";
import { Reflect } from "tsafe/Reflect";
import type { BuildOptions } from "../BuildOptions";
import { type ThemeType, resources_common, lastKeycloakVersionWithAccountV1 } from "../../constants";
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

export async function generateJavaStackFiles(params: {
    projectDirPath: string;
    keycloakThemeBuildingDirPath: string;
    implementedThemeTypes: Record<ThemeType | "email", boolean>;
    buildOptions: BuildOptionsLike;
}): Promise<{
    jarFilePath: string;
}> {
    const {
        projectDirPath,
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
            projectDirPath,
            "destDirPath": builtinKeycloakThemeTmpDirPath,
            "keycloakVersion": lastKeycloakVersionWithAccountV1
        });

        const accountV1DirPath = pathJoin(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme", accountV1, "account");

        transformCodebase({
            "srcDirPath": pathJoin(builtinKeycloakThemeTmpDirPath, "base", "account"),
            "destDirPath": accountV1DirPath
        });

        const commonResourceFilePaths = [
            "node_modules/patternfly/dist/css/patternfly.min.css",
            "node_modules/patternfly/dist/css/patternfly-additions.min.css"
        ];

        for (const relativeFilePath of commonResourceFilePaths.map(path => pathJoin(...path.split("/")))) {
            const destFilePath = pathJoin(accountV1DirPath, "resources", resources_common, relativeFilePath);

            fs.mkdirSync(pathDirname(destFilePath), { "recursive": true });

            fs.cpSync(pathJoin(builtinKeycloakThemeTmpDirPath, "keycloak", "common", "resources", relativeFilePath), destFilePath);
        }

        const resourceFilePaths = ["css/account.css"];

        for (const relativeFilePath of resourceFilePaths.map(path => pathJoin(...path.split("/")))) {
            const destFilePath = pathJoin(accountV1DirPath, "resources", relativeFilePath);

            fs.mkdirSync(pathDirname(destFilePath), { "recursive": true });

            fs.cpSync(pathJoin(builtinKeycloakThemeTmpDirPath, "keycloak", "account", "resources", relativeFilePath), destFilePath);
        }

        fs.rmdirSync(builtinKeycloakThemeTmpDirPath, { "recursive": true });

        fs.writeFileSync(
            pathJoin(accountV1DirPath, "theme.properties"),
            Buffer.from(
                [
                    "accountResourceProvider=org.keycloak.services.resources.account.AccountFormService",
                    "",
                    "locales=ar,ca,cs,da,de,en,es,fr,fi,hu,it,ja,lt,nl,no,pl,pt-BR,ru,sk,sv,tr,zh-CN",
                    "",
                    "styles=" + [...resourceFilePaths, ...commonResourceFilePaths.map(path => `resources_common/${path}`)].join(" "),
                    "",
                    "##### css classes for form buttons",
                    "# main class used for all buttons",
                    "kcButtonClass=btn",
                    "# classes defining priority of the button - primary or default (there is typically only one priority button for the form)",
                    "kcButtonPrimaryClass=btn-primary",
                    "kcButtonDefaultClass=btn-default",
                    "# classes defining size of the button",
                    "kcButtonLargeClass=btn-lg",
                    ""
                ].join("\n"),
                "utf8"
            )
        );
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
                                "name": accountV1,
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
