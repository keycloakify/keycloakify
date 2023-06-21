import "minimal-polyfills/Object.fromEntries";
import * as fs from "fs";
import { join as pathJoin, relative as pathRelative, dirname as pathDirname, sep as pathSep } from "path";
import { crawl } from "../src/bin/tools/crawl";
import { downloadBuiltinKeycloakTheme } from "../src/bin/download-builtin-keycloak-theme";
import { getProjectRoot } from "../src/bin/tools/getProjectRoot";
import { getLogger } from "../src/bin/tools/logger";

// NOTE: To run without argument when we want to generate src/i18n/generated_kcMessages files,
// update the version array for generating for newer version.

//@ts-ignore
const propertiesParser = require("properties-parser");

const isSilent = true;

const logger = getLogger({ isSilent });

async function main() {
    const keycloakVersion = "21.0.1";

    const tmpDirPath = pathJoin(getProjectRoot(), "tmp_xImOef9dOd44");

    fs.rmSync(tmpDirPath, { "recursive": true, "force": true });

    await downloadBuiltinKeycloakTheme({
        keycloakVersion,
        "destDirPath": tmpDirPath,
        isSilent
    });

    type Dictionary = { [idiomId: string]: string };

    const record: { [typeOfPage: string]: { [language: string]: Dictionary } } = {};

    {
        const baseThemeDirPath = pathJoin(tmpDirPath, "base");
        const re = new RegExp(`^([^\\${pathSep}]+)\\${pathSep}messages\\${pathSep}messages_([^.]+).properties$`);

        crawl({
            "dirPath": baseThemeDirPath,
            "returnedPathsType": "relative to dirPath"
        }).forEach(filePath => {
            const match = filePath.match(re);

            if (match === null) {
                return;
            }

            const [, typeOfPage, language] = match;

            (record[typeOfPage] ??= {})[language.replace(/_/g, "-")] = Object.fromEntries(
                Object.entries(propertiesParser.parse(fs.readFileSync(pathJoin(baseThemeDirPath, filePath)).toString("utf8"))).map(
                    ([key, value]: any) => [key, value.replace(/''/g, "'")]
                )
            );
        });
    }

    fs.rmSync(tmpDirPath, { recursive: true, force: true });

    Object.keys(record).forEach(themeType => {
        const recordForPageType = record[themeType];

        if (themeType !== "login" && themeType !== "account") {
            return;
        }

        const baseMessagesDirPath = pathJoin(getProjectRoot(), "src", themeType, "i18n", "baseMessages");

        const languages = Object.keys(recordForPageType);

        const generatedFileHeader = [
            `//This code was automatically generated by running ${pathRelative(getProjectRoot(), __filename)}`,
            "//PLEASE DO NOT EDIT MANUALLY",
            ""
        ].join("\n");

        languages.forEach(language => {
            const filePath = pathJoin(baseMessagesDirPath, `${language}.ts`);

            fs.mkdirSync(pathDirname(filePath), { "recursive": true });

            fs.writeFileSync(
                filePath,
                Buffer.from(
                    [
                        generatedFileHeader,
                        "/* spell-checker: disable */",
                        `const messages= ${JSON.stringify(recordForPageType[language], null, 2)};`,
                        "",
                        "export default messages;",
                        "/* spell-checker: enable */"
                    ].join("\n"),
                    "utf8"
                )
            );

            logger.log(`${filePath} wrote`);
        });

        fs.writeFileSync(
            pathJoin(baseMessagesDirPath, "index.ts"),
            Buffer.from(
                [
                    generatedFileHeader,
                    "export async function getMessages(currentLanguageTag: string) {",
                    "    const { default: messages } = await (() => {",
                    "        switch (currentLanguageTag) {",
                    ...languages.map(language => `            case "${language}": return import("./${language}");`),
                    '            default: return { "default": {} };',
                    "        }",
                    "    })();",
                    "    return messages;",
                    "}"
                ].join("\n"),
                "utf8"
            )
        );
    });
}

if (require.main === module) {
    main();
}
