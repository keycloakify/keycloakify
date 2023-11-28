import type { ThemeType } from "../../constants";
import { crawl } from "../../tools/crawl";
import { join as pathJoin } from "path";
import { readFileSync } from "fs";
import { symToStr } from "tsafe/symToStr";
import { removeDuplicates } from "evt/tools/reducers/removeDuplicates";
import * as recast from "recast";
import * as babelParser from "@babel/parser";
import babelGenerate from "@babel/generator";
import * as babelTypes from "@babel/types";

export function generateMessageProperties(params: {
    themeSrcDirPath: string;
    themeType: ThemeType;
}): { languageTag: string; propertiesFileSource: string }[] {
    const { themeSrcDirPath, themeType } = params;

    let files = crawl({
        "dirPath": pathJoin(themeSrcDirPath, themeType),
        "returnedPathsType": "absolute"
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

    files = files.filter(file => readFileSync(file).toString("utf8").includes("createUseI18n"));

    if (files.length === 0) {
        return [];
    }

    const extraMessages = files
        .map(file => {
            const root = recast.parse(readFileSync(file).toString("utf8"), {
                "parser": {
                    "parse": (code: string) => babelParser.parse(code, { "sourceType": "module", "plugins": ["typescript"] }),
                    "generator": babelGenerate,
                    "types": babelTypes
                }
            });

            const codes: string[] = [];

            recast.visit(root, {
                "visitCallExpression": function (path) {
                    if (path.node.callee.type === "Identifier" && path.node.callee.name === "createUseI18n") {
                        codes.push(babelGenerate(path.node.arguments[0] as any).code);
                    }
                    this.traverse(path);
                }
            });

            return codes;
        })
        .flat()
        .map(code => {
            let extraMessages: { [languageTag: string]: Record<string, string> } = {};

            try {
                eval(`${symToStr({ extraMessages })} = ${code}`);
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

            return extraMessages;
        });

    const languageTags = extraMessages
        .map(extraMessage => Object.keys(extraMessage))
        .flat()
        .reduce(...removeDuplicates<string>());

    const keyValueMapByLanguageTag: Record<string, Record<string, string>> = {};

    for (const languageTag of languageTags) {
        const keyValueMap: Record<string, string> = {};

        for (const extraMessage of extraMessages) {
            const keyValueMap_i = extraMessage[languageTag];

            if (keyValueMap_i === undefined) {
                continue;
            }

            for (const [key, value] of Object.entries(keyValueMap_i)) {
                if (keyValueMap[key] !== undefined) {
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

        keyValueMapByLanguageTag[languageTag] = keyValueMap;
    }

    const out: { languageTag: string; propertiesFileSource: string }[] = [];

    for (const [languageTag, keyValueMap] of Object.entries(keyValueMapByLanguageTag)) {
        const propertiesFileSource = Object.entries(keyValueMap)
            .map(([key, value]) => `${key}=${escapeString(value)}`)
            .join("\n");

        out.push({
            languageTag,
            "propertiesFileSource": ["# This file was generated by keycloakify", "", "parent=base", "", propertiesFileSource, ""].join("\n")
        });
    }

    return out;
}

// Convert a JavaScript string to UTF-16 encoding
function toUTF16(codePoint: number): string {
    if (codePoint <= 0xffff) {
        // BMP character
        return "\\u" + codePoint.toString(16).padStart(4, "0");
    } else {
        // Non-BMP character
        codePoint -= 0x10000;
        let highSurrogate = (codePoint >> 10) + 0xd800;
        let lowSurrogate = (codePoint % 0x400) + 0xdc00;
        return "\\u" + highSurrogate.toString(16).padStart(4, "0") + "\\u" + lowSurrogate.toString(16).padStart(4, "0");
    }
}

// Escapes special characters and converts unicode to UTF-16 encoding
function escapeString(str: string): string {
    let escapedStr = "";
    for (const char of [...str]) {
        const codePoint = char.codePointAt(0);
        if (!codePoint) continue;
        if (char === "'") {
            escapedStr += "''"; // double single quotes
        } else if (codePoint > 0x7f) {
            escapedStr += toUTF16(codePoint); // non-ascii characters
        } else {
            escapedStr += char;
        }
    }
    return escapedStr;
}
