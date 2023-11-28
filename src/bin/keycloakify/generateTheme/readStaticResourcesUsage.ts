import { crawl } from "../../tools/crawl";
import { join as pathJoin, sep as pathSep } from "path";
import * as fs from "fs";
import type { ThemeType } from "../../constants";

/** Assumes the theme type exists */
export function readStaticResourcesUsage(params: { keycloakifySrcDirPath: string; themeSrcDirPath: string; themeType: ThemeType }): {
    resourcesCommonFilePaths: string[];
} {
    const { keycloakifySrcDirPath, themeSrcDirPath, themeType } = params;

    const resourcesCommonFilePaths = new Set<string>();

    for (const srcDirPath of [pathJoin(keycloakifySrcDirPath, themeType), pathJoin(themeSrcDirPath, themeType)]) {
        const filePaths = crawl({ "dirPath": srcDirPath, "returnedPathsType": "absolute" }).filter(filePath => /\.(ts|tsx|js|jsx)$/.test(filePath));

        for (const filePath of filePaths) {
            const rawSourceFile = fs.readFileSync(filePath).toString("utf8");

            if (!rawSourceFile.includes("resourcesCommonPath") && !rawSourceFile.includes("resourcesPath")) {
                continue;
            }

            const wrap = readPaths({ rawSourceFile });

            wrap.resourcesCommonFilePaths.forEach(filePath => resourcesCommonFilePaths.add(filePath));
        }
    }

    return {
        "resourcesCommonFilePaths": Array.from(resourcesCommonFilePaths)
    };
}

/** Exported for testing purpose */
export function readPaths(params: { rawSourceFile: string }): {
    resourcesCommonFilePaths: string[];
} {
    const { rawSourceFile } = params;

    const resourcesCommonFilePaths = new Set<string>();

    {
        const regexp = new RegExp(`resourcesCommonPath\\s*}([^\`]+)\``, "g");

        const matches = [...rawSourceFile.matchAll(regexp)];

        for (const match of matches) {
            const filePath = match[1];

            resourcesCommonFilePaths.add(filePath);
        }
    }

    {
        const regexp = new RegExp(`resourcesCommonPath\\s*[+,]\\s*["']([^"'\`]+)["'\`]`, "g");

        const matches = [...rawSourceFile.matchAll(regexp)];

        for (const match of matches) {
            const filePath = match[1];

            resourcesCommonFilePaths.add(filePath);
        }
    }

    const normalizePath = (filePath: string) => {
        filePath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
        filePath = filePath.replace(/\//g, pathSep);
        return filePath;
    };

    return {
        "resourcesCommonFilePaths": Array.from(resourcesCommonFilePaths).map(normalizePath)
    };
}
