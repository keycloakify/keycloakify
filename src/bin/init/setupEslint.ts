import { join as pathJoin } from "path";
import { existsAsync } from "../tools/fs.existsAsync";
import * as fs from "fs/promises";
import * as recast from "recast";
import { runPrettier, getIsPrettierAvailable } from "../tools/runPrettier";
import * as babelParser from "@babel/parser";
import babelGenerate from "@babel/generator";
import * as babelTypes from "@babel/types";

/** This function will just set reportUnusedDisableDirectives to off so that we don't get warning on generated files */
export async function setupEslint(params: { projectDirPath: string }) {
    const { projectDirPath } = params;

    const eslintConfigJsFilePath = pathJoin(projectDirPath, "eslint.config.js");

    if (!(await existsAsync(eslintConfigJsFilePath))) {
        return;
    }

    const eslintConfigJsContent = (await fs.readFile(eslintConfigJsFilePath)).toString(
        "utf8"
    );

    if (eslintConfigJsContent.includes("reportUnusedDisableDirectives")) {
        return;
    }

    const root = recast.parse(eslintConfigJsContent, {
        parser: {
            parse: (code: string) =>
                babelParser.parse(code, {
                    sourceType: "module",
                    plugins: ["typescript"]
                })
        }
    });

    recast.visit(root, {
        visitExportDefaultDeclaration(path) {
            // @ts-expect-error
            const args = path.node.declaration.arguments;

            if (!Array.isArray(args)) return false;

            args.push(
                babelTypes.objectExpression([
                    babelTypes.objectProperty(
                        babelTypes.identifier("linterOptions"),
                        babelTypes.objectExpression([
                            babelTypes.objectProperty(
                                babelTypes.identifier("reportUnusedDisableDirectives"),
                                babelTypes.stringLiteral("off")
                            )
                        ])
                    )
                ])
            );

            return false;
        }
    });

    let eslintConfigJsContent_modified = babelGenerate(root).code;

    format: {
        if (!(await getIsPrettierAvailable())) {
            break format;
        }

        eslintConfigJsContent_modified = await runPrettier({
            sourceCode: eslintConfigJsContent_modified,
            filePath: eslintConfigJsFilePath
        });
    }

    await fs.writeFile(
        eslintConfigJsFilePath,
        Buffer.from(eslintConfigJsContent_modified, "utf8")
    );
}
