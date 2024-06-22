import { type ThemeType, fallbackLanguageTag } from "../../shared/constants";
import { crawl } from "../../tools/crawl";
import { join as pathJoin } from "path";
import { readFileSync } from "fs";
import { symToStr } from "tsafe/symToStr";
import { removeDuplicates } from "evt/tools/reducers/removeDuplicates";
import * as recast from "recast";
import * as babelParser from "@babel/parser";
import babelGenerate from "@babel/generator";
import * as babelTypes from "@babel/types";
import { escapeStringForPropertiesFile } from "../../tools/escapeStringForPropertiesFile";
import { getThisCodebaseRootDirPath } from "../../tools/getThisCodebaseRootDirPath";
import * as fs from "fs";

export function generateMessageProperties(params: {
    themeSrcDirPath: string;
    themeType: ThemeType;
}): { languageTag: string; propertiesFileSource: string }[] {
    const { themeSrcDirPath, themeType } = params;

    let files = crawl({
        dirPath: pathJoin(themeSrcDirPath, themeType),
        returnedPathsType: "absolute"
    });

    files = files.filter(file => {
        const regex = /\.(js|ts|tsx)$/;
        return regex.test(file);
    });

    files = files.sort((a, b) => {
        const regex = /\.i18n\.(ts|js|tsx)$/;
        const aIsI18nFile = regex.test(a);
        const bIsI18nFile = regex.test(b);
        return aIsI18nFile === bIsI18nFile ? 0 : aIsI18nFile ? -1 : 1;
    });

    files = files.sort((a, b) => a.length - b.length);

    files = files.filter(file =>
        readFileSync(file).toString("utf8").includes("createUseI18n")
    );

    const messageBundles = files
        .map(file => {
            const root = recast.parse(readFileSync(file).toString("utf8"), {
                parser: {
                    parse: (code: string) =>
                        babelParser.parse(code, {
                            sourceType: "module",
                            plugins: ["typescript"]
                        }),
                    generator: babelGenerate,
                    types: babelTypes
                }
            });

            const codes: string[] = [];

            recast.visit(root, {
                visitCallExpression: function (path) {
                    if (
                        path.node.callee.type === "Identifier" &&
                        path.node.callee.name === "createUseI18n"
                    ) {
                        codes.push(babelGenerate(path.node.arguments[0] as any).code);
                    }
                    this.traverse(path);
                }
            });

            return codes;
        })
        .flat()
        .map(code => {
            let messageBundle: {
                [languageTag: string]: Record<string, string>;
            } = {};

            try {
                eval(`${symToStr({ messageBundle })} = ${code}`);
            } catch {
                console.warn(
                    [
                        "WARNING: Make sure that the first argument of createUseI18n can be evaluated in a javascript",
                        "runtime where only the node globals are available.",
                        "This is important because we need to put your i18n messages in messages_*.properties files",
                        "or they won't be available server side.",
                        "\n",
                        "The following code could not be evaluated:",
                        "\n",
                        code
                    ].join(" ")
                );
            }

            return messageBundle;
        });

    const languageTags_messageBundle = messageBundles
        .map(extraMessage => Object.keys(extraMessage))
        .flat()
        .reduce(...removeDuplicates<string>());

    const keyValueMapByLanguageTag: Record<string, Record<string, string>> = {};

    languageTags_messageBundle.forEach(languageTag_messageBundle => {
        const keyValueMap: Record<string, string> = {
            termsText: ""
        };

        for (const messageBundle of messageBundles) {
            const keyValueMap_i = messageBundle[languageTag_messageBundle];

            if (keyValueMap_i === undefined) {
                continue;
            }

            for (const [key, value] of Object.entries(keyValueMap_i)) {
                if (key !== "termsText" && keyValueMap[key] !== undefined) {
                    console.warn(
                        [
                            "WARNING: The following key is defined multiple times:",
                            "\n",
                            key,
                            "\n",
                            "The following value will be ignored:",
                            "\n",
                            value,
                            "\n",
                            "The following value was already defined:",
                            "\n",
                            keyValueMap[key]
                        ].join(" ")
                    );
                    continue;
                }

                keyValueMap[key] = value;
            }
        }

        keyValueMapByLanguageTag[languageTag_messageBundle] = keyValueMap;
    });

    fs.readdirSync(
        pathJoin(getThisCodebaseRootDirPath(), "src", themeType, "i18n", "baseMessages")
    )
        .filter(baseName => baseName !== "index.ts")
        .map(baseName => baseName.replace(/\.ts$/, ""))
        .filter(languageTag => !languageTags_messageBundle.includes(languageTag))
        .forEach(
            languageTag_noMessageBundle =>
                (keyValueMapByLanguageTag[languageTag_noMessageBundle] =
                    keyValueMapByLanguageTag[fallbackLanguageTag] ??
                        keyValueMapByLanguageTag[
                            Object.keys(keyValueMapByLanguageTag)[0]
                        ] ?? {
                            termsText: ""
                        })
        );

    const out: { languageTag: string; propertiesFileSource: string }[] = [];

    for (const [languageTag, keyValueMap] of Object.entries(keyValueMapByLanguageTag)) {
        const propertiesFileSource = Object.entries(keyValueMap)
            .map(([key, value]) => `${key}=${escapeStringForPropertiesFile(value)}`)
            .join("\n");

        out.push({
            languageTag,
            propertiesFileSource: ["", "parent=base", "", propertiesFileSource, ""].join(
                "\n"
            )
        });
    }

    return out;
}
