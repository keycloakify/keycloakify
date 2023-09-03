import { crawl } from "../../tools/crawl";
import { join as pathJoin } from "path";
import * as fs from "fs";
import type { ThemeType } from "../../constants";

/** Assumes the theme type exists */
export function readStaticResourcesUsage(params: { keycloakifySrcDirPath: string; themeSrcDirPath: string; themeType: ThemeType }): {
    resourcesCommonFilePaths: string[];
    resourcesFilePaths: string[];
} {
    const { keycloakifySrcDirPath, themeSrcDirPath, themeType } = params;

    const resourcesCommonFilePaths = new Set<string>();
    const resourcesFilePaths = new Set<string>();

    for (const srcDirPath of [pathJoin(keycloakifySrcDirPath, themeType), pathJoin(themeSrcDirPath, themeType)]) {
        const filePaths = crawl({ "dirPath": srcDirPath, "returnedPathsType": "absolute" }).filter(filePath => /\.(ts|tsx|js|jsx)$/.test(filePath));

        for (const filePath of filePaths) {
            const rawSourceFile = fs.readFileSync(filePath).toString("utf8");

            if (!rawSourceFile.includes("resourcesCommonPath") && !rawSourceFile.includes("resourcesPath")) {
                continue;
            }

            const wrap = readPaths({ rawSourceFile });

            wrap.resourcesCommonFilePaths.forEach(filePath => resourcesCommonFilePaths.add(filePath));
            wrap.resourcesFilePaths.forEach(filePath => resourcesFilePaths.add(filePath));
        }
    }

    return {
        "resourcesCommonFilePaths": Array.from(resourcesCommonFilePaths),
        "resourcesFilePaths": Array.from(resourcesFilePaths)
    };
}

/** Exported for testing purpose */
export function readPaths(params: { rawSourceFile: string }): {
    resourcesCommonFilePaths: string[];
    resourcesFilePaths: string[];
} {
    const { rawSourceFile } = params;

    const resourcesCommonFilePaths = new Set<string>();
    const resourcesFilePaths = new Set<string>();

    for (const isCommon of [true, false]) {
        const set = isCommon ? resourcesCommonFilePaths : resourcesFilePaths;

        {
            const regexp = new RegExp(`resources${isCommon ? "Common" : ""}Path\\s*}([^\`]+)\``, "g");

            const matches = [...rawSourceFile.matchAll(regexp)];

            for (const match of matches) {
                const filePath = match[1];

                set.add(filePath);
            }
        }

        {
            const regexp = new RegExp(`resources${isCommon ? "Common" : ""}Path\\s*[+,]\\s*["']([^"'\`]+)["'\`]`, "g");

            const matches = [...rawSourceFile.matchAll(regexp)];

            for (const match of matches) {
                const filePath = match[1];

                set.add(filePath);
            }
        }
    }

    const removePrefixSlash = (filePath: string) => (filePath.startsWith("/") ? filePath.slice(1) : filePath);

    return {
        "resourcesCommonFilePaths": Array.from(resourcesCommonFilePaths).map(removePrefixSlash),
        "resourcesFilePaths": Array.from(resourcesFilePaths).map(removePrefixSlash)
    };
}
