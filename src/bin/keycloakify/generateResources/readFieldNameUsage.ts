import { crawl } from "../../tools/crawl";
import { join as pathJoin } from "path";
import * as fs from "fs";
import type { ThemeType } from "../../shared/constants";
import { getThisCodebaseRootDirPath } from "../../tools/getThisCodebaseRootDirPath";

/** Assumes the theme type exists */
export function readFieldNameUsage(params: {
    themeSrcDirPath: string;
    themeType: ThemeType;
}): string[] {
    const { themeSrcDirPath, themeType } = params;

    // NOTE: We pre-populate with the synthetic user attributes defined in useUserProfileForm (can't be parsed automatically)
    const fieldNames = new Set<string>([
        "firstName",
        "lastName",
        "email",
        "username",
        "password",
        "password-confirm"
    ]);

    for (const srcDirPath of [
        pathJoin(getThisCodebaseRootDirPath(), "src", themeType),
        pathJoin(themeSrcDirPath, themeType)
    ]) {
        const filePaths = crawl({
            dirPath: srcDirPath,
            returnedPathsType: "absolute"
        }).filter(filePath => /\.(ts|tsx|js|jsx)$/.test(filePath));

        for (const filePath of filePaths) {
            const rawSourceFile = fs.readFileSync(filePath).toString("utf8");

            if (!rawSourceFile.includes("messagesPerField")) {
                continue;
            }

            for (const functionName of [
                "printIfExists",
                "existsError",
                "get",
                "exists",
                "getFirstError"
            ] as const) {
                if (!rawSourceFile.includes(functionName)) {
                    continue;
                }

                try {
                    rawSourceFile
                        .split(functionName)
                        .filter(part => part.startsWith("("))
                        .map(part => {
                            let [p1] = part.split(")");

                            p1 = p1.slice(1);

                            return p1;
                        })
                        .map(part => {
                            return part
                                .split(",")
                                .map(a => a.trim())
                                .filter((...[, i]) =>
                                    functionName !== "printIfExists" ? true : i === 0
                                )
                                .filter(
                                    a =>
                                        a.startsWith('"') ||
                                        a.startsWith("'") ||
                                        a.startsWith("`")
                                )
                                .filter(
                                    a =>
                                        a.endsWith('"') ||
                                        a.endsWith("'") ||
                                        a.endsWith("`")
                                )
                                .map(a => a.slice(1).slice(0, -1));
                        })
                        .flat()
                        .forEach(fieldName => fieldNames.add(fieldName));
                } catch {}
            }
        }
    }

    return Array.from(fieldNames);
}
