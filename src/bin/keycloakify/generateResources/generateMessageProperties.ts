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
import type { BuildContext } from "../../shared/buildContext";

export type BuildContextLike = {
    themeNames: string[];
    themeSrcDirPath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export function generateMessageProperties(params: {
    buildContext: BuildContextLike;
    themeType: ThemeType;
}): {
    languageTags: string[];
    writeMessagePropertiesFiles: (params: {
        messageDirPath: string;
        themeName: string;
    }) => void;
} {
    const { buildContext, themeType } = params;

    const baseMessagesDirPath = pathJoin(
        getThisCodebaseRootDirPath(),
        "src",
        themeType,
        "i18n",
        "messages_defaultSet"
    );

    const messages_defaultSet_by_languageTag_defaultSet: {
        [languageTag_defaultSet: string]: Record<string, string>;
    } = Object.fromEntries(
        fs
            .readdirSync(baseMessagesDirPath)
            .filter(basename => basename !== "index.ts" && basename !== "types.ts")
            .map(basename => ({
                languageTag: basename.replace(/\.ts$/, ""),
                filePath: pathJoin(baseMessagesDirPath, basename)
            }))
            .map(({ languageTag, filePath }) => {
                const lines = fs.readFileSync(filePath).toString("utf8").split(/\r?\n/);

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
            dirPath: pathJoin(buildContext.themeSrcDirPath, themeType),
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
            fs.readFileSync(file).toString("utf8").includes("i18nBuilder")
        );

        const i18nTsFilePath: string | undefined = files[0];

        return { i18nTsFilePath };
    })();

    const i18nTsRoot = (() => {
        if (i18nTsFilePath === undefined) {
            return undefined;
        }
        const root: recast.types.ASTNode = recast.parse(
            fs.readFileSync(i18nTsFilePath).toString("utf8"),
            {
                parser: {
                    parse: (code: string) =>
                        babelParser.parse(code, {
                            sourceType: "module",
                            plugins: ["typescript"]
                        }),
                    generator: babelGenerate,
                    types: babelTypes
                }
            }
        );
        return root;
    })();

    const messages_defaultSet_by_languageTag_notInDefaultSet:
        | { [languageTag_notInDefaultSet: string]: Record<string, string> }
        | undefined = (() => {
        if (i18nTsRoot === undefined) {
            return undefined;
        }

        let firstArgumentCode: string | undefined = undefined;

        recast.visit(i18nTsRoot, {
            visitCallExpression: function (path) {
                const node = path.node;

                if (
                    node.callee.type === "MemberExpression" &&
                    node.callee.property.type === "Identifier" &&
                    node.callee.property.name === "withExtraLanguages"
                ) {
                    firstArgumentCode = babelGenerate(node.arguments[0] as any).code;
                    return false;
                }

                this.traverse(path);
            }
        });

        if (firstArgumentCode === undefined) {
            return undefined;
        }

        //todo

        //TODO
        return {};
    })();

    const messages_defaultSet_by_languageTag = {
        ...messages_defaultSet_by_languageTag_defaultSet,
        ...messages_defaultSet_by_languageTag_notInDefaultSet
    };

    const messages_themeDefined_by_languageTag:
        | {
              [languageTag: string]:
                  | Record<string, string | Record<string, string>>
                  | undefined;
          }
        | undefined = (() => {
        if (i18nTsRoot === undefined) {
            return undefined;
        }

        let firstArgumentCode: string | undefined = undefined;

        recast.visit(i18nTsRoot, {
            visitCallExpression: function (path) {
                const node = path.node;

                if (
                    node.callee.type === "MemberExpression" &&
                    node.callee.property.type === "Identifier" &&
                    node.callee.property.name === "withCustomTranslations"
                ) {
                    firstArgumentCode = babelGenerate(node.arguments[0] as any).code;
                    return false;
                }

                this.traverse(path);
            }
        });

        if (firstArgumentCode === undefined) {
            return undefined;
        }

        let messages_themeDefined_by_languageTag: {
            [languageTag: string]: Record<string, string | Record<string, string>>;
        } = {};

        try {
            eval(
                `${symToStr({ messages_themeDefined_by_languageTag })} = ${firstArgumentCode}`
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
                    firstArgumentCode
                ].join(" ")
            );
            return undefined;
        }

        return messages_themeDefined_by_languageTag;
    })();

    const languageTags = Object.keys(messages_defaultSet_by_languageTag);

    return {
        languageTags,
        writeMessagePropertiesFiles: ({ messageDirPath, themeName }) => {
            for (const languageTag of languageTags) {
                const messages = {
                    ...messages_defaultSet_by_languageTag[languageTag]
                };

                add_theme_defined_messages: {
                    if (messages_themeDefined_by_languageTag === undefined) {
                        break add_theme_defined_messages;
                    }

                    let messages_themeDefined =
                        messages_themeDefined_by_languageTag[languageTag];

                    if (messages_themeDefined === undefined) {
                        messages_themeDefined =
                            messages_themeDefined_by_languageTag[FALLBACK_LANGUAGE_TAG];
                    }
                    if (messages_themeDefined === undefined) {
                        messages_themeDefined =
                            messages_themeDefined_by_languageTag[
                                Object.keys(messages_themeDefined_by_languageTag)[0]
                            ];
                    }
                    if (messages_themeDefined === undefined) {
                        break add_theme_defined_messages;
                    }

                    for (const [key, messageOrMessageByThemeName] of Object.entries(
                        messages_themeDefined
                    )) {
                        const message = (() => {
                            if (typeof messageOrMessageByThemeName === "string") {
                                return messageOrMessageByThemeName;
                            }

                            const message = messageOrMessageByThemeName[themeName];

                            assert(message !== undefined);

                            return message;
                        })();

                        messages[key] = message;
                    }
                }

                const propertiesFileSource = [
                    "",
                    ...Object.entries(messages).map(
                        ([key, value]) => `${key}=${escapeStringForPropertiesFile(value)}`
                    ),
                    ""
                ].join("\n");

                fs.writeFileSync(
                    pathJoin(messageDirPath, `messages_${languageTag}.properties`),
                    Buffer.from(propertiesFileSource, "utf8")
                );
            }
        }
    };
}
