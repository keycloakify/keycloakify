import * as fs from "fs";
import { join as pathJoin, dirname as pathDirname } from "path";
import { assert } from "tsafe/assert";
import type { BuildOptions } from "./BuildOptions";
import type { ThemeType } from "./generateFtl";

export type BuildOptionsLike = {
    themeName: string;
    extraThemeNames: string[];
    groupId: string;
    artifactId: string;
    themeVersion: string;
};

assert<BuildOptions extends BuildOptionsLike ? true : false>();

export function generateJavaStackFiles(params: {
    keycloakThemeBuildingDirPath: string;
    implementedThemeTypes: Record<ThemeType | "email", boolean>;
    buildOptions: BuildOptionsLike;
}): {
    jarFilePath: string;
} {
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
                `</project>`
            ].join("\n");

            return { pomFileCode };
        })();

        fs.writeFileSync(pathJoin(keycloakThemeBuildingDirPath, "pom.xml"), Buffer.from(pomFileCode, "utf8"));
    }

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
                        "themes": [themeName, ...extraThemeNames].map(themeName => ({
                            "name": themeName,
                            "types": Object.entries(implementedThemeTypes)
                                .filter(([, isImplemented]) => isImplemented)
                                .map(([themeType]) => themeType)
                        }))
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
