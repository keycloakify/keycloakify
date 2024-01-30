import { join as pathJoin, relative as pathRelative, sep as pathSep } from "path";
import { getParsedPackageJson } from "../bin/keycloakify/parsedPackageJson";
import type { Plugin } from "vite";
import { assert } from "tsafe/assert";
import * as fs from "fs";
import { keycloakifyViteConfigJsonBasename, nameOfTheGlobal, basenameOfTheKeycloakifyResourcesDir } from "../bin/constants";
import { type ParsedKeycloakifyViteConfig, getKeycloakifyBuildDirPath } from "../bin/keycloakify/parsedKeycloakifyViteConfig";
import { replaceAll } from "../bin/tools/String.prototype.replaceAll";
import { id } from "tsafe/id";

export function keycloakify(): Plugin {
    let reactAppRootDirPath: string | undefined = undefined;
    let urlPathname: string | undefined = undefined;

    return {
        "name": "keycloakify",
        "configResolved": resolvedConfig => {
            reactAppRootDirPath = resolvedConfig.root;
            urlPathname = (() => {
                let out = resolvedConfig.env.BASE_URL;

                if (out === undefined) {
                    return undefined;
                }

                if (!out.startsWith("/")) {
                    out = "/" + out;
                }

                if (!out.endsWith("/")) {
                    out += "/";
                }

                return out;
            })();

            const { keycloakifyBuildDirPath } = getKeycloakifyBuildDirPath({
                "parsedPackageJson_keycloakify_keycloakifyBuildDirPath": getParsedPackageJson({ reactAppRootDirPath }).keycloakify
                    ?.keycloakifyBuildDirPath,
                reactAppRootDirPath,
                "bundler": "vite"
            });

            if (!fs.existsSync(keycloakifyBuildDirPath)) {
                fs.mkdirSync(keycloakifyBuildDirPath);
            }

            fs.writeFileSync(
                pathJoin(keycloakifyBuildDirPath, keycloakifyViteConfigJsonBasename),
                Buffer.from(
                    JSON.stringify(
                        id<ParsedKeycloakifyViteConfig>({
                            "publicDir": pathRelative(reactAppRootDirPath, resolvedConfig.publicDir),
                            "assetsDir": resolvedConfig.build.assetsDir,
                            "buildDir": resolvedConfig.build.outDir,
                            urlPathname
                        }),
                        null,
                        2
                    ),
                    "utf8"
                )
            );
        },
        "transform": (code, id) => {
            assert(reactAppRootDirPath !== undefined);

            let transformedCode: string | undefined = undefined;

            replace_import_meta_env_base_url_in_source_code: {
                {
                    const isWithinSourceDirectory = id.startsWith(pathJoin(reactAppRootDirPath, "src") + pathSep);

                    if (!isWithinSourceDirectory) {
                        break replace_import_meta_env_base_url_in_source_code;
                    }
                }

                const isJavascriptFile = id.endsWith(".js") || id.endsWith(".jsx");

                {
                    const isTypeScriptFile = id.endsWith(".ts") || id.endsWith(".tsx");

                    if (!isTypeScriptFile && !isJavascriptFile) {
                        break replace_import_meta_env_base_url_in_source_code;
                    }
                }

                const windowToken = isJavascriptFile ? "window" : "(window as any)";

                if (transformedCode === undefined) {
                    transformedCode = code;
                }

                transformedCode = replaceAll(
                    transformedCode,
                    "import.meta.env.BASE_URL",
                    [
                        `(`,
                        `(${windowToken}.${nameOfTheGlobal} === undefined || import.meta.env.MODE === "development") ?`,
                        `    "${urlPathname ?? "/"}" :`,
                        `    \`\${${windowToken}.${nameOfTheGlobal}.url.resourcesPath}/${basenameOfTheKeycloakifyResourcesDir}/\``,
                        `)`
                    ].join("")
                );
            }

            if (transformedCode === undefined) {
                return;
            }

            return {
                "code": transformedCode
            };
        }
    };
}
