import * as fs from "fs";
import { join as pathJoin, dirname as pathDirname } from "path";
import { themeTypes } from "./generateFtl/generateFtl";
import { assert } from "tsafe/assert";
import { Reflect } from "tsafe/Reflect";
import type { BuildOptions } from "./BuildOptions";

export type BuildOptionsLike = {
    themeName: string;
    groupId: string;
    artifactId?: string;
    version: string;
};

{
    const buildOptions = Reflect<BuildOptions>();

    assert<typeof buildOptions extends BuildOptionsLike ? true : false>();
}

export function generateJavaStackFiles(params: {
    keycloakThemeBuildingDirPath: string;
    doBundlesEmailTemplate: boolean;
    buildOptions: BuildOptionsLike;
}): {
    jarFilePath: string;
} {
    const {
        buildOptions: { groupId, themeName, version, artifactId },
        keycloakThemeBuildingDirPath,
        doBundlesEmailTemplate
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
                `	<version>${version}</version>`,
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
                        "themes": [
                            {
                                "name": themeName,
                                "types": [...themeTypes, ...(doBundlesEmailTemplate ? ["email"] : [])]
                            }
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
        "jarFilePath": pathJoin(keycloakThemeBuildingDirPath, "target", `${artifactId}-${version}.jar`)
    };
}
