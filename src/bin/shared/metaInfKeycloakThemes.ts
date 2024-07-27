import { join as pathJoin, dirname as pathDirname } from "path";
import type { ThemeType } from "./constants";
import * as fs from "fs";

export type MetaInfKeycloakTheme = {
    themes: { name: string; types: (ThemeType | "email")[] }[];
};

export function writeMetaInfKeycloakThemes(params: {
    resourcesDirPath: string;
    getNewMetaInfKeycloakTheme: (params: {
        metaInfKeycloakTheme: MetaInfKeycloakTheme | undefined;
    }) => MetaInfKeycloakTheme;
}) {
    const { resourcesDirPath, getNewMetaInfKeycloakTheme } = params;

    const filePath = pathJoin(resourcesDirPath, "META-INF", "keycloak-themes.json");

    const currentMetaInfKeycloakTheme = !fs.existsSync(filePath)
        ? undefined
        : (JSON.parse(
              fs.readFileSync(filePath).toString("utf8")
          ) as MetaInfKeycloakTheme);

    const newMetaInfKeycloakThemes = getNewMetaInfKeycloakTheme({
        metaInfKeycloakTheme: currentMetaInfKeycloakTheme
    });

    {
        const dirPath = pathDirname(filePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    fs.writeFileSync(
        filePath,
        Buffer.from(JSON.stringify(newMetaInfKeycloakThemes, null, 2), "utf8")
    );
}
