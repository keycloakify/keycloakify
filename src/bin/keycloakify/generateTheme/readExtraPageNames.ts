import { crawl } from "../../tools/crawl";
import { accountThemePageIds, loginThemePageIds } from "../generateFtl";
import { id } from "tsafe/id";
import { removeDuplicates } from "evt/tools/reducers/removeDuplicates";
import * as fs from "fs";
import { join as pathJoin } from "path";
import type { ThemeType } from "../../constants";

export function readExtraPagesNames(params: { themeSrcDirPath: string; themeType: ThemeType }): string[] {
    const { themeSrcDirPath, themeType } = params;

    const filePaths = crawl({
        "dirPath": pathJoin(themeSrcDirPath, themeType),
        "returnedPathsType": "absolute"
    }).filter(filePath => /\.(ts|tsx|js|jsx)$/.test(filePath));

    const candidateFilePaths = filePaths.filter(filePath => /kcContext\.[^.]+$/.test(filePath));

    if (candidateFilePaths.length === 0) {
        candidateFilePaths.push(...filePaths);
    }

    const extraPages: string[] = [];

    for (const candidateFilPath of candidateFilePaths) {
        const rawSourceFile = fs.readFileSync(candidateFilPath).toString("utf8");

        extraPages.push(...Array.from(rawSourceFile.matchAll(/["']?pageId["']?\s*:\s*["']([^.]+.ftl)["']/g), m => m[1]));
    }

    return extraPages.reduce(...removeDuplicates<string>()).filter(pageId => {
        switch (themeType) {
            case "account":
                return !id<readonly string[]>(accountThemePageIds).includes(pageId);
            case "login":
                return !id<readonly string[]>(loginThemePageIds).includes(pageId);
        }
    });
}
