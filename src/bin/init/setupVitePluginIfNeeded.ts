import { join as pathJoin } from "path";
import { existsAsync } from "../tools/fs.existsAsync";
import * as fs from "fs/promises";
import * as recast from "recast";
import { runPrettier, getIsPrettierAvailable } from "../tools/runPrettier";
import * as babelParser from "@babel/parser";
import babelGenerate from "@babel/generator";
import * as babelTypes from "@babel/types";

/** Best effort to setup the Keycloakify vite plugin automatically */
export async function setupVitePluginIfNeeded(params: { projectDirPath: string }) {
    const { projectDirPath } = params;

    const viteConfigTsFilePath = pathJoin(projectDirPath, "vite.config.ts");

    if (!(await existsAsync(viteConfigTsFilePath))) {
        return;
    }

    const viteConfigTsContent = (await fs.readFile(viteConfigTsFilePath)).toString(
        "utf8"
    );

    if (viteConfigTsContent.includes("keycloakify")) {
        return;
    }

    const root = recast.parse(viteConfigTsContent, {
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

    /* Before: 
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [ react() ]
});
        */

    /* After: 
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { keycloakify } from "keycloakify/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        keycloakify({
            accountThemeImplementation: "none"
        })
    ]
});
        */

    recast.visit(root, {
        visitProgram(path) {
            const body = path.node.body;

            // Add import: import { keycloakify } from "keycloakify/vite-plugin";
            const importDeclaration = babelTypes.importDeclaration(
                [
                    babelTypes.importSpecifier(
                        babelTypes.identifier("keycloakify"),
                        babelTypes.identifier("keycloakify")
                    )
                ],
                babelTypes.stringLiteral("keycloakify/vite-plugin")
            );
            // @ts-expect-error
            body.unshift(importDeclaration);

            this.traverse(path);
        },
        visitCallExpression(path) {
            const { node } = path;

            if (
                // @ts-expect-error
                babelTypes.isIdentifier(node.callee, { name: "defineConfig" }) &&
                node.arguments.length === 1 &&
                // @ts-expect-error
                babelTypes.isObjectExpression(node.arguments[0])
            ) {
                const configObject = node.arguments[0];
                const pluginsProp = configObject.properties.find(
                    prop =>
                        // @ts-expect-error
                        babelTypes.isObjectProperty(prop) &&
                        babelTypes.isIdentifier(prop.key, { name: "plugins" }) &&
                        babelTypes.isArrayExpression(prop.value)
                ) as babelTypes.ObjectProperty | undefined;

                if (pluginsProp && babelTypes.isArrayExpression(pluginsProp.value)) {
                    // Append keycloakify plugin config
                    const keycloakifyCall = babelTypes.callExpression(
                        babelTypes.identifier("keycloakify"),
                        [
                            babelTypes.objectExpression([
                                babelTypes.objectProperty(
                                    babelTypes.identifier("accountThemeImplementation"),
                                    babelTypes.stringLiteral("none")
                                )
                            ])
                        ]
                    );

                    pluginsProp.value.elements.push(keycloakifyCall);
                }
            }

            this.traverse(path);
        }
    });

    let viteConfigTsContent_modified = babelGenerate(root).code;

    format: {
        if (!(await getIsPrettierAvailable())) {
            break format;
        }

        viteConfigTsContent_modified = await runPrettier({
            sourceCode: viteConfigTsContent_modified,
            filePath: viteConfigTsFilePath
        });
    }

    await fs.writeFile(
        viteConfigTsFilePath,
        Buffer.from(viteConfigTsContent_modified, "utf8")
    );
}
