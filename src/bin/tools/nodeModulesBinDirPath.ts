import { sep as pathSep, dirname as pathDirname, join as pathJoin } from "path";
import { getThisCodebaseRootDirPath } from "./getThisCodebaseRootDirPath";
import { getInstalledModuleDirPath } from "./getInstalledModuleDirPath";
import { existsAsync } from "./fs.existsAsync";
import { z } from "zod";
import * as fs from "fs/promises";
import { assert, is, type Equals } from "tsafe/assert";
import { id } from "tsafe/id";

let cache_bestEffort: string | undefined = undefined;

/** NOTE: Careful, this function can fail when the binary
 *  Used is not in the node_modules directory of the project
 * (for example when running tests with vscode extension we'll get
 * '/Users/dylan/.vscode/extensions/vitest.explorer-1.16.0/dist/worker.js'
 *
 * instead of
 * '/Users/joseph/.nvm/versions/node/v22.12.0/bin/node'
 * or
 * '/Users/joseph/github/keycloakify-starter/node_modules/.bin/vite'
 *
 * as the value of process.argv[1]
 */
function getNodeModulesBinDirPath_bestEffort() {
    if (cache_bestEffort !== undefined) {
        return cache_bestEffort;
    }

    const binPath = process.argv[1];

    const segments: string[] = [".bin"];

    let foundNodeModules = false;

    for (const segment of binPath.split(pathSep).reverse()) {
        skip_segment: {
            if (foundNodeModules) {
                break skip_segment;
            }

            if (segment === "node_modules") {
                foundNodeModules = true;
                break skip_segment;
            }

            continue;
        }

        segments.unshift(segment);
    }

    if (!foundNodeModules) {
        throw new Error(`Could not find node_modules in path ${binPath}`);
    }

    const nodeModulesBinDirPath = segments.join(pathSep);

    cache_bestEffort = nodeModulesBinDirPath;

    return nodeModulesBinDirPath;
}

let cache_withPackageJsonFileDirPath:
    | { packageJsonFilePath: string; nodeModulesBinDirPath: string }
    | undefined = undefined;

async function getNodeModulesBinDirPath_withPackageJsonFileDirPath(params: {
    packageJsonFilePath: string;
}): Promise<string> {
    const { packageJsonFilePath } = params;

    use_cache: {
        if (cache_withPackageJsonFileDirPath === undefined) {
            break use_cache;
        }

        if (
            cache_withPackageJsonFileDirPath.packageJsonFilePath !== packageJsonFilePath
        ) {
            cache_withPackageJsonFileDirPath = undefined;
            break use_cache;
        }

        return cache_withPackageJsonFileDirPath.nodeModulesBinDirPath;
    }

    // [...]node_modules/keycloakify
    const installedModuleDirPath = await getInstalledModuleDirPath({
        // Here it will always be "keycloakify" but since we are in tools/ we make something generic
        moduleName: await (async () => {
            type ParsedPackageJson = {
                name: string;
            };

            const zParsedPackageJson = (() => {
                type TargetType = ParsedPackageJson;

                const zTargetType = z.object({
                    name: z.string()
                });

                assert<Equals<z.infer<typeof zTargetType>, TargetType>>;

                return id<z.ZodType<TargetType>>(zTargetType);
            })();

            const parsedPackageJson = JSON.parse(
                (
                    await fs.readFile(
                        pathJoin(getThisCodebaseRootDirPath(), "package.json")
                    )
                ).toString("utf8")
            );

            zParsedPackageJson.parse(parsedPackageJson);

            assert(is<ParsedPackageJson>(parsedPackageJson));

            return parsedPackageJson.name;
        })(),
        packageJsonDirPath: pathDirname(packageJsonFilePath)
    });

    const segments = installedModuleDirPath.split(pathSep);

    while (true) {
        const segment = segments.pop();

        if (segment === undefined) {
            throw new Error(
                `Could not find .bin directory relative to ${packageJsonFilePath}`
            );
        }

        if (segment !== "node_modules") {
            continue;
        }

        const candidate = pathJoin(segments.join(pathSep), segment, ".bin");

        if (!(await existsAsync(candidate))) {
            continue;
        }

        cache_withPackageJsonFileDirPath = {
            packageJsonFilePath,
            nodeModulesBinDirPath: candidate
        };

        break;
    }

    return cache_withPackageJsonFileDirPath.nodeModulesBinDirPath;
}

export function getNodeModulesBinDirPath(params: {
    packageJsonFilePath: string;
}): Promise<string>;
export function getNodeModulesBinDirPath(params: {
    packageJsonFilePath: undefined;
}): string;
export function getNodeModulesBinDirPath(params: {
    packageJsonFilePath: string | undefined;
}): string | Promise<string> {
    const { packageJsonFilePath } = params ?? {};

    return packageJsonFilePath === undefined
        ? getNodeModulesBinDirPath_bestEffort()
        : getNodeModulesBinDirPath_withPackageJsonFileDirPath({ packageJsonFilePath });
}
