import { join as pathJoin, extname as pathExtname, sep as pathSep } from "path";
import { transformCodebase } from "../../tools/transformCodebase";
import { assert } from "tsafe/assert";
import * as fs from "fs";

export function generateThemeVariations(params: { themeName: string; themeVariantName: string; srcMainResourcesDirPath: string }) {
    const { themeName, themeVariantName, srcMainResourcesDirPath } = params;

    const mainThemeDirPath = pathJoin(srcMainResourcesDirPath, "theme", themeName);

    transformCodebase({
        "srcDirPath": mainThemeDirPath,
        "destDirPath": pathJoin(mainThemeDirPath, "..", themeVariantName),
        "transformSourceCode": ({ fileRelativePath, sourceCode }) => {
            if (pathExtname(fileRelativePath) === ".ftl" && fileRelativePath.split(pathSep).length === 2) {
                const modifiedSourceCode = Buffer.from(
                    Buffer.from(sourceCode)
                        .toString("utf-8")
                        .replace(`out["themeName"] = "${themeName}";`, `out["themeName"] = "${themeVariantName}";`),
                    "utf8"
                );

                assert(Buffer.compare(modifiedSourceCode, sourceCode) !== 0);

                return { modifiedSourceCode };
            }

            return { "modifiedSourceCode": sourceCode };
        }
    });

    {
        const keycloakThemeJsonFilePath = pathJoin(srcMainResourcesDirPath, "META-INF", "keycloak-themes.json");

        const modifiedParsedJson = JSON.parse(fs.readFileSync(keycloakThemeJsonFilePath).toString("utf8")) as {
            themes: { name: string; types: string[] }[];
        };

        modifiedParsedJson.themes.push({
            "name": themeVariantName,
            "types": (() => {
                const theme = modifiedParsedJson.themes.find(({ name }) => name === themeName);
                assert(theme !== undefined);
                return theme.types;
            })()
        });

        fs.writeFileSync(keycloakThemeJsonFilePath, Buffer.from(JSON.stringify(modifiedParsedJson, null, 2), "utf8"));
    }
}
