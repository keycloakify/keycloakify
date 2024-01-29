import { join as pathJoin, sep as pathSep } from "path";
import { getParsedPackageJson } from "../bin/keycloakify/parsedPackageJson";
import type { Plugin } from "vite";
import { assert } from "tsafe/assert";
import { getAbsoluteAndInOsFormatPath } from "../bin/tools/getAbsoluteAndInOsFormatPath";
import * as fs from "fs";
import { keycloakifyViteConfigJsonBasename, nameOfTheGlobal, basenameOfTheKeycloakifyResourcesDir } from "../bin/constants";
import type { ParsedKeycloakifyViteConfig } from "../bin/keycloakify/parsedKeycloakifyViteConfig";
import { replaceAll } from "../bin/tools/String.prototype.replaceAll";

export function keycloakify(): Plugin {
    let keycloakifyViteConfig: ParsedKeycloakifyViteConfig | undefined = undefined;

    return {
        "name": "keycloakify",
        "configResolved": resolvedConfig => {
            const reactAppRootDirPath = resolvedConfig.root;
            const reactAppBuildDirPath = pathJoin(reactAppRootDirPath, resolvedConfig.build.outDir);

            keycloakifyViteConfig = {
                reactAppRootDirPath,
                "publicDirPath": resolvedConfig.publicDir,
                "assetsDirPath": pathJoin(reactAppBuildDirPath, resolvedConfig.build.assetsDir),
                reactAppBuildDirPath,
                "urlPathname": (() => {
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
                })()
            };

            const parsedPackageJson = getParsedPackageJson({ reactAppRootDirPath });

            if (parsedPackageJson.keycloakify?.reactAppBuildDirPath !== undefined) {
                throw new Error(
                    [
                        "Please do not use the keycloakify.reactAppBuildDirPath option in your package.json.",
                        "In Vite setups it's inferred automatically from the vite config."
                    ].join(" ")
                );
            }

            const keycloakifyBuildDirPath = (() => {
                const { keycloakifyBuildDirPath } = parsedPackageJson.keycloakify ?? {};

                if (keycloakifyBuildDirPath !== undefined) {
                    return getAbsoluteAndInOsFormatPath({
                        "pathIsh": keycloakifyBuildDirPath,
                        "cwd": reactAppRootDirPath
                    });
                }

                return pathJoin(reactAppRootDirPath, "build_keycloak");
            })();

            if (!fs.existsSync(keycloakifyBuildDirPath)) {
                fs.mkdirSync(keycloakifyBuildDirPath);
            }

            fs.writeFileSync(
                pathJoin(keycloakifyBuildDirPath, keycloakifyViteConfigJsonBasename),
                Buffer.from(JSON.stringify(keycloakifyViteConfig, null, 2), "utf8")
            );
        },
        "transform": (code, id) => {
            assert(keycloakifyViteConfig !== undefined);

            let transformedCode: string | undefined = undefined;

            replace_import_meta_env_base_url_in_source_code: {
                {
                    const isWithinSourceDirectory = id.startsWith(pathJoin(keycloakifyViteConfig.publicDirPath, "src") + pathSep);

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
                        `    "${keycloakifyViteConfig.urlPathname ?? "/"}" :`,
                        `    \`\${${windowToken}.${nameOfTheGlobal}.url.resourcesPath}/${basenameOfTheKeycloakifyResourcesDir}/\``,
                        `)`
                    ].join("")
                );
            }

            if (transformedCode !== undefined) {
                return {
                    "code": transformedCode
                };
            }
        }
    };
}
