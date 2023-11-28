import { crawl } from "../../tools/crawl";
import { removeDuplicates } from "evt/tools/reducers/removeDuplicates";
import { join as pathJoin } from "path";
import * as fs from "fs";
import type { ThemeType } from "../../constants";

/** Assumes the theme type exists */
export function readFieldNameUsage(params: { keycloakifySrcDirPath: string; themeSrcDirPath: string; themeType: ThemeType }): string[] {
    const { keycloakifySrcDirPath, themeSrcDirPath, themeType } = params;

    const fieldNames: string[] = [];

    for (const srcDirPath of [pathJoin(keycloakifySrcDirPath, themeType), pathJoin(themeSrcDirPath, themeType)]) {
        const filePaths = crawl({ "dirPath": srcDirPath, "returnedPathsType": "absolute" }).filter(filePath => /\.(ts|tsx|js|jsx)$/.test(filePath));

        for (const filePath of filePaths) {
            const rawSourceFile = fs.readFileSync(filePath).toString("utf8");

            if (!rawSourceFile.includes("messagesPerField")) {
                continue;
            }

            fieldNames.push(
                ...Array.from(rawSourceFile.matchAll(/(?:(?:printIfExists)|(?:existsError)|(?:get)|(?:exists))\(\s*["']([^"']+)["']/g), m => m[1])
            );
        }
    }

    const out = fieldNames.reduce(...removeDuplicates<string>());

    return out;
}
