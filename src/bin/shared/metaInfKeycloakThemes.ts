import { join as pathJoin, dirname as pathDirname } from "path";
import type { ThemeType } from "./constants";
import * as fs from "fs";

export type MetaInfKeycloakTheme = {
    themes: { name: string; types: (ThemeType | "email")[] }[];
};

export function getMetaInfKeycloakThemesJsonFilePath(params: {
    keycloakifyBuildDirPath: string;
}) {
    const { keycloakifyBuildDirPath } = params;

    return pathJoin(
        keycloakifyBuildDirPath === "." ? "" : keycloakifyBuildDirPath,
        "src",
        "main",
        "resources",
        "META-INF",
        "keycloak-themes.json"
    );
}

export function readMetaInfKeycloakThemes(params: {
    keycloakifyBuildDirPath: string;
}): MetaInfKeycloakTheme {
    const { keycloakifyBuildDirPath } = params;

    return JSON.parse(
        fs
            .readFileSync(
                getMetaInfKeycloakThemesJsonFilePath({
                    keycloakifyBuildDirPath
                })
            )
            .toString("utf8")
    ) as MetaInfKeycloakTheme;
}

export function writeMetaInfKeycloakThemes(params: {
    keycloakifyBuildDirPath: string;
    metaInfKeycloakThemes: MetaInfKeycloakTheme;
}) {
    const { keycloakifyBuildDirPath, metaInfKeycloakThemes } = params;

    const metaInfKeycloakThemesJsonPath = getMetaInfKeycloakThemesJsonFilePath({
        keycloakifyBuildDirPath
    });

    {
        const dirPath = pathDirname(metaInfKeycloakThemesJsonPath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    fs.writeFileSync(
        metaInfKeycloakThemesJsonPath,
        Buffer.from(JSON.stringify(metaInfKeycloakThemes, null, 2), "utf8")
    );
}
