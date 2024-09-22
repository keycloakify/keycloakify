import { type ThemeType, FALLBACK_LANGUAGE_TAG } from "../../shared/constants";
import { crawl } from "../../tools/crawl";
import { join as pathJoin, dirname as pathDirname } from "path";
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
import { getAbsoluteAndInOsFormatPath } from "../../tools/getAbsoluteAndInOsFormatPath";

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
        const root = recastParseTs(i18nTsFilePath);
        return root;
    })();

    const messages_defaultSet_by_languageTag_notInDefaultSet:
        | { [languageTag_notInDefaultSet: string]: Record<string, string> }
        | undefined = (() => {
        if (i18nTsRoot === undefined) {
            return undefined;
        }

        let extraLanguageEntryByLanguageTag: Record<
            string,
            { label: string; path: string }
        > = {};

        recast.visit(i18nTsRoot, {
            visitCallExpression: function (path) {
                const node = path.node;

                // Check if the callee is a MemberExpression with property 'withExtraLanguages'
                if (
                    node.callee.type === "MemberExpression" &&
                    node.callee.property.type === "Identifier" &&
                    node.callee.property.name === "withExtraLanguages"
                ) {
                    const arg = node.arguments[0];
                    if (arg && arg.type === "ObjectExpression") {
                        // Iterate over the properties of the object
                        arg.properties.forEach(prop => {
                            if (
                                prop.type === "ObjectProperty" &&
                                prop.key.type === "Identifier"
                            ) {
                                const lang = prop.key.name;
                                const value = prop.value;

                                if (value.type === "ObjectExpression") {
                                    let label: string | undefined = undefined;
                                    let pathStr: string | undefined = undefined;

                                    // Iterate over the properties of the language object
                                    value.properties.forEach(p => {
                                        if (
                                            p.type === "ObjectProperty" &&
                                            p.key.type === "Identifier"
                                        ) {
                                            if (
                                                p.key.name === "label" &&
                                                p.value.type === "StringLiteral"
                                            ) {
                                                label = p.value.value;
                                            }
                                            if (
                                                p.key.name === "getMessages" &&
                                                (p.value.type ===
                                                    "ArrowFunctionExpression" ||
                                                    p.value.type === "FunctionExpression")
                                            ) {
                                                // Extract the import path from the function body
                                                const body = p.value.body;
                                                if (
                                                    body.type === "CallExpression" &&
                                                    body.callee.type === "Import"
                                                ) {
                                                    const importArg = body.arguments[0];
                                                    if (
                                                        importArg.type === "StringLiteral"
                                                    ) {
                                                        pathStr = importArg.value;
                                                    }
                                                } else if (
                                                    body.type === "BlockStatement"
                                                ) {
                                                    // If the function body is a block (e.g., function with braces {})
                                                    // Look for return statement
                                                    body.body.forEach(statement => {
                                                        if (
                                                            statement.type ===
                                                                "ReturnStatement" &&
                                                            statement.argument &&
                                                            statement.argument.type ===
                                                                "CallExpression" &&
                                                            statement.argument.callee
                                                                .type === "Import"
                                                        ) {
                                                            const importArg =
                                                                statement.argument
                                                                    .arguments[0];
                                                            if (
                                                                importArg.type ===
                                                                "StringLiteral"
                                                            ) {
                                                                pathStr = importArg.value;
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    });

                                    if (label && pathStr) {
                                        extraLanguageEntryByLanguageTag[lang] = {
                                            label,
                                            path: pathStr
                                        };
                                    }
                                }
                            }
                        });
                    }

                    return false; // Stop traversing this path
                }

                this.traverse(path); // Continue traversing other paths
            }
        });

        const messages_defaultSet_by_languageTag_notInDefaultSet = Object.fromEntries(
            Object.entries(extraLanguageEntryByLanguageTag).map(
                ([languageTag, { path: relativePathWithoutExt }]) => [
                    languageTag,
                    (() => {
                        const filePath = getAbsoluteAndInOsFormatPath({
                            pathIsh: relativePathWithoutExt.endsWith(".ts")
                                ? relativePathWithoutExt
                                : `${relativePathWithoutExt}.ts`,
                            cwd: pathDirname(i18nTsFilePath)
                        });

                        const root = recastParseTs(filePath);

                        let declarationCode: string | undefined = "";

                        recast.visit(root, {
                            visitVariableDeclarator: function (path) {
                                const node = path.node;

                                // Check if the variable name is 'messages'
                                if (
                                    node.id.type === "Identifier" &&
                                    node.id.name === "messages"
                                ) {
                                    // Ensure there is an initializer
                                    if (node.init) {
                                        // Generate code from the initializer, preserving comments
                                        declarationCode = recast
                                            .print(node.init)
                                            .code.replace(/}.*$/, "}");
                                    }
                                    return false; // Stop traversing this path
                                }

                                this.traverse(path); // Continue traversing other paths
                            }
                        });

                        assert(
                            declarationCode !== undefined,
                            `${filePath} does not contain a 'messages' variable declaration`
                        );

                        let messages: Record<string, string> = {};

                        try {
                            eval(`${symToStr({ messages })} = ${declarationCode};`);
                        } catch {
                            throw new Error(
                                `The declaration of 'message' in ${filePath} cannot be statically evaluated: ${declarationCode}`
                            );
                        }

                        return messages;
                    })()
                ]
            )
        );

        return messages_defaultSet_by_languageTag_notInDefaultSet;
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
                    "WARNING: The argument of withCustomTranslations can't be statically evaluated!",
                    "This needs to be fixed refer to the documentation: https://docs.keycloakify.dev/i18n",
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

                fs.mkdirSync(messageDirPath, { recursive: true });

                fs.writeFileSync(
                    pathJoin(messageDirPath, `messages_${languageTag}.properties`),
                    Buffer.from(propertiesFileSource, "utf8")
                );
            }
        }
    };
}

function recastParseTs(filePath: string): recast.types.ASTNode {
    return recast.parse(fs.readFileSync(filePath).toString("utf8"), {
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
}
