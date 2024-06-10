import { join as pathJoin, dirname as pathDirname } from "path";
import type { ThemeType } from "./constants";
import * as fs from "fs";
import { assert } from "tsafe/assert";
import { extractArchive } from "../tools/extractArchive";

export type MetaInfKeycloakTheme = {
    themes: { name: string; types: (ThemeType | "email")[] }[];
};

export function getMetaInfKeycloakThemesJsonFilePath(params: {
    resourcesDirPath: string;
}) {
    const { resourcesDirPath } = params;

    return pathJoin(
        resourcesDirPath === "." ? "" : resourcesDirPath,
        "META-INF",
        "keycloak-themes.json"
    );
}

export function readMetaInfKeycloakThemes_fromResourcesDirPath(params: {
    resourcesDirPath: string;
}) {
    const { resourcesDirPath } = params;

    return JSON.parse(
        fs
            .readFileSync(
                getMetaInfKeycloakThemesJsonFilePath({
                    resourcesDirPath
                })
            )
            .toString("utf8")
    ) as MetaInfKeycloakTheme;
}

export async function readMetaInfKeycloakThemes_fromJar(params: {
    jarFilePath: string;
}): Promise<MetaInfKeycloakTheme> {
    const { jarFilePath } = params;
    let metaInfKeycloakThemes: MetaInfKeycloakTheme | undefined = undefined;

    await extractArchive({
        archiveFilePath: jarFilePath,
        onArchiveFile: async ({ relativeFilePathInArchive, readFile, earlyExit }) => {
            if (
                relativeFilePathInArchive ===
                getMetaInfKeycloakThemesJsonFilePath({ resourcesDirPath: "." })
            ) {
                metaInfKeycloakThemes = JSON.parse((await readFile()).toString("utf8"));
                earlyExit();
            }
        }
    });

    assert(metaInfKeycloakThemes !== undefined);

    return metaInfKeycloakThemes;
}

export function writeMetaInfKeycloakThemes(params: {
    resourcesDirPath: string;
    metaInfKeycloakThemes: MetaInfKeycloakTheme;
}) {
    const { resourcesDirPath, metaInfKeycloakThemes } = params;

    const metaInfKeycloakThemesJsonPath = getMetaInfKeycloakThemesJsonFilePath({
        resourcesDirPath
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
