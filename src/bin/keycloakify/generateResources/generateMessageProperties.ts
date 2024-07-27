import { type ThemeType, FALLBACK_LANGUAGE_TAG } from "../../shared/constants";
import { crawl } from "../../tools/crawl";
import { join as pathJoin } from "path";
import { symToStr } from "tsafe/symToStr";
import * as recast from "recast";
import * as babelParser from "@babel/parser";
import babelGenerate from "@babel/generator";
import * as babelTypes from "@babel/types";
import { escapeStringForPropertiesFile } from "../../tools/escapeStringForPropertiesFile";
import { getThisCodebaseRootDirPath } from "../../tools/getThisCodebaseRootDirPath";
import * as fs from "fs";
import { assert } from "tsafe/assert";

export function generateMessageProperties(params: {
    themeSrcDirPath: string;
    themeType: ThemeType;
}): { languageTag: string; propertiesFileSource: string }[] {
    const { themeSrcDirPath, themeType } = params;

    const baseMessagesDirPath = pathJoin(
        getThisCodebaseRootDirPath(),
        "src",
        themeType,
        "i18n",
        "messages_defaultSet"
    );

    const baseMessageBundle: { [languageTag: string]: Record<string, string> } =
        Object.fromEntries(
            fs
                .readdirSync(baseMessagesDirPath)
                .filter(baseName => baseName !== "index.ts")
                .map(basename => ({
                    languageTag: basename.replace(/\.ts$/, ""),
                    filePath: pathJoin(baseMessagesDirPath, basename)
                }))
                .map(({ languageTag, filePath }) => {
                    const lines = fs
                        .readFileSync(filePath)
                        .toString("utf8")
                        .split(/\r?\n/);

                    let messagesJson = "{";

                    let isInDeclaration = false;

                    for (const line of lines) {
                        if (!isInDeclaration) {
                            if (line.startsWith("const messages")) {
                                isInDeclaration = true;
                            }

                            continue;
                        }

                        if (line.startsWith("}")) {
                            messagesJson += "}";
                            break;
                        }

                        messagesJson += line;
                    }

                    const messages = JSON.parse(messagesJson) as Record<string, string>;

                    return [languageTag, messages];
                })
        );

    const { i18nTsFilePath } = (() => {
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
            fs.readFileSync(file).toString("utf8").includes("createUseI18n(")
        );

        const i18nTsFilePath: string | undefined = files[0];

        return { i18nTsFilePath };
    })();

    const messageBundle: { [languageTag: string]: Record<string, string> } | undefined =
        (() => {
            if (i18nTsFilePath === undefined) {
                return undefined;
            }

            const root = recast.parse(fs.readFileSync(i18nTsFilePath).toString("utf8"), {
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

            let messageBundleDeclarationTsCode: string | undefined = undefined;

            recast.visit(root, {
                visitCallExpression: function (path) {
                    if (
                        path.node.callee.type === "Identifier" &&
                        path.node.callee.name === "createUseI18n"
                    ) {
                        messageBundleDeclarationTsCode = babelGenerate(
                            path.node.arguments[0] as any
                        ).code;
                        return false;
                    }

                    this.traverse(path);
                }
            });

            assert(messageBundleDeclarationTsCode !== undefined);

            let messageBundle: {
                [languageTag: string]: Record<string, string>;
            } = {};

            try {
                eval(
                    `${symToStr({ messageBundle })} = ${messageBundleDeclarationTsCode}`
                );
            } catch {
                console.warn(
                    [
                        "WARNING: Make sure the messageBundle your provided as argument of createUseI18n can be statically evaluated.",
                        "This is important because we need to put your i18n messages in messages_*.properties files",
                        "or they won't be available server side.",
                        "\n",
                        "The following code could not be evaluated:",
                        "\n",
                        messageBundleDeclarationTsCode
                    ].join(" ")
                );
            }

            return messageBundle;
        })();

    const mergedMessageBundle: { [languageTag: string]: Record<string, string> } =
        Object.fromEntries(
            Object.entries(baseMessageBundle).map(([languageTag, messages]) => [
                languageTag,
                {
                    ...messages,
                    ...(messageBundle === undefined
                        ? {}
                        : messageBundle[languageTag] ??
                          messageBundle[FALLBACK_LANGUAGE_TAG] ??
                          messageBundle[Object.keys(messageBundle)[0]] ??
                          {})
                }
            ])
        );

    const messageProperties: { languageTag: string; propertiesFileSource: string }[] =
        Object.entries(mergedMessageBundle).map(([languageTag, messages]) => ({
            languageTag,
            propertiesFileSource: [
                "",
                ...(themeType !== "account" ? ["parent=base"] : []),
                ...Object.entries(messages).map(
                    ([key, value]) => `${key}=${escapeStringForPropertiesFile(value)}`
                ),
                ""
            ].join("\n")
        }));

    return messageProperties;
}
