import { assert, type Equals } from "tsafe/assert";
import { id } from "tsafe/id";
import { z } from "zod";
import { join as pathJoin, dirname as pathDirname } from "path";
import * as fsPr from "fs/promises";
import type { BuildContext } from "../shared/buildContext";
import { is } from "tsafe/is";
import { existsAsync } from "../tools/fs.existsAsync";
import { listInstalledModules } from "../tools/listInstalledModules";
import { crawlAsync } from "../tools/crawlAsync";
import { getIsPrettierAvailable, getPrettier } from "../tools/runPrettier";
import { readThisNpmPackageVersion } from "../tools/readThisNpmPackageVersion";
import {
    getUiModuleFileSourceCodeReadyToBeCopied,
    type BuildContextLike as BuildContextLike_getUiModuleFileSourceCodeReadyToBeCopied
} from "./getUiModuleFileSourceCodeReadyToBeCopied";
import * as crypto from "crypto";
import { KEYCLOAK_THEME } from "../shared/constants";

export type UiModuleMeta = {
    moduleName: string;
    version: string;
    files: {
        fileRelativePath: string;
        hash: string;
        copyableFilePath: string;
    }[];
    peerDependencies: Record<string, string>;
};

const zUiModuleMeta = (() => {
    type ExpectedType = UiModuleMeta;

    const zTargetType = z.object({
        moduleName: z.string(),
        version: z.string(),
        files: z.array(
            z.object({
                fileRelativePath: z.string(),
                hash: z.string(),
                copyableFilePath: z.string()
            })
        ),
        peerDependencies: z.record(z.string())
    });

    type InferredType = z.infer<typeof zTargetType>;

    assert<Equals<InferredType, ExpectedType>>();

    return id<z.ZodType<ExpectedType>>(zTargetType);
})();

type ParsedCacheFile = {
    keycloakifyVersion: string;
    prettierConfigHash: string | null;
    thisFilePath: string;
    uiModuleMetas: UiModuleMeta[];
};

const zParsedCacheFile = (() => {
    type ExpectedType = ParsedCacheFile;

    const zTargetType = z.object({
        keycloakifyVersion: z.string(),
        prettierConfigHash: z.union([z.string(), z.null()]),
        thisFilePath: z.string(),
        uiModuleMetas: z.array(zUiModuleMeta)
    });

    type InferredType = z.infer<typeof zTargetType>;

    assert<Equals<InferredType, ExpectedType>>();

    return id<z.ZodType<ExpectedType>>(zTargetType);
})();

const CACHE_FILE_RELATIVE_PATH = pathJoin("ui-modules", "cache.json");

export type BuildContextLike =
    BuildContextLike_getUiModuleFileSourceCodeReadyToBeCopied & {
        cacheDirPath: string;
        packageJsonFilePath: string;
        projectDirPath: string;
    };

assert<BuildContext extends BuildContextLike ? true : false>();

export async function getUiModuleMetas(params: {
    buildContext: BuildContextLike;
}): Promise<UiModuleMeta[]> {
    const { buildContext } = params;

    const cacheFilePath = pathJoin(buildContext.cacheDirPath, CACHE_FILE_RELATIVE_PATH);

    const keycloakifyVersion = readThisNpmPackageVersion();

    const prettierConfigHash = await (async () => {
        if (!(await getIsPrettierAvailable())) {
            return null;
        }

        const { configHash } = await getPrettier();

        return configHash;
    })();

    const installedUiModules = await (async () => {
        const installedModulesWithKeycloakifyInTheName = await listInstalledModules({
            packageJsonFilePath: buildContext.packageJsonFilePath,
            projectDirPath: buildContext.packageJsonFilePath,
            filter: ({ moduleName }) =>
                moduleName.includes("keycloakify") && moduleName !== "keycloakify"
        });

        return Promise.all(
            installedModulesWithKeycloakifyInTheName.filter(async ({ dirPath }) =>
                existsAsync(pathJoin(dirPath, KEYCLOAK_THEME))
            )
        );
    })();

    const cacheContent = await (async () => {
        if (!(await existsAsync(cacheFilePath))) {
            return undefined;
        }

        return await fsPr.readFile(cacheFilePath);
    })();

    const uiModuleMetas_cacheUpToDate: UiModuleMeta[] = await (async () => {
        const parsedCacheFile: ParsedCacheFile | undefined = await (async () => {
            if (cacheContent === undefined) {
                return undefined;
            }

            const cacheContentStr = cacheContent.toString("utf8");

            let parsedCacheFile: unknown;

            try {
                parsedCacheFile = JSON.parse(cacheContentStr);
            } catch {
                return undefined;
            }

            try {
                zParsedCacheFile.parse(parsedCacheFile);
            } catch {
                return undefined;
            }

            assert(is<ParsedCacheFile>(parsedCacheFile));

            return parsedCacheFile;
        })();

        if (parsedCacheFile === undefined) {
            return [];
        }

        if (parsedCacheFile.keycloakifyVersion !== keycloakifyVersion) {
            return [];
        }

        if (parsedCacheFile.prettierConfigHash !== prettierConfigHash) {
            return [];
        }

        if (parsedCacheFile.thisFilePath !== cacheFilePath) {
            return [];
        }

        const uiModuleMetas_cacheUpToDate = parsedCacheFile.uiModuleMetas.filter(
            uiModuleMeta => {
                const correspondingInstalledUiModule = installedUiModules.find(
                    installedUiModule =>
                        installedUiModule.moduleName === uiModuleMeta.moduleName
                );

                if (correspondingInstalledUiModule === undefined) {
                    return false;
                }

                return correspondingInstalledUiModule.version === uiModuleMeta.version;
            }
        );

        return uiModuleMetas_cacheUpToDate;
    })();

    const uiModuleMetas = await Promise.all(
        installedUiModules.map(
            async ({
                moduleName,
                version,
                peerDependencies,
                dirPath
            }): Promise<UiModuleMeta> => {
                use_cache: {
                    const uiModuleMeta_cache = uiModuleMetas_cacheUpToDate.find(
                        uiModuleMeta => uiModuleMeta.moduleName === moduleName
                    );

                    if (uiModuleMeta_cache === undefined) {
                        break use_cache;
                    }

                    return uiModuleMeta_cache;
                }

                const files: UiModuleMeta["files"] = [];

                {
                    const srcDirPath = pathJoin(dirPath, KEYCLOAK_THEME);

                    await crawlAsync({
                        dirPath: srcDirPath,
                        returnedPathsType: "relative to dirPath",
                        onFileFound: async fileRelativePath => {
                            const sourceCode =
                                await getUiModuleFileSourceCodeReadyToBeCopied({
                                    buildContext,
                                    fileRelativePath,
                                    isForEjection: false,
                                    uiModuleDirPath: dirPath,
                                    uiModuleName: moduleName,
                                    uiModuleVersion: version
                                });

                            const hash = computeHash(sourceCode);

                            const copyableFilePath = pathJoin(
                                pathDirname(cacheFilePath),
                                KEYCLOAK_THEME,
                                fileRelativePath
                            );

                            {
                                const dirPath = pathDirname(copyableFilePath);

                                if (!(await existsAsync(dirPath))) {
                                    await fsPr.mkdir(dirPath, { recursive: true });
                                }
                            }

                            fsPr.writeFile(copyableFilePath, sourceCode);

                            files.push({
                                fileRelativePath,
                                hash,
                                copyableFilePath
                            });
                        }
                    });
                }

                return id<UiModuleMeta>({
                    moduleName,
                    version,
                    files,
                    peerDependencies
                });
            }
        )
    );

    update_cache: {
        const parsedCacheFile = id<ParsedCacheFile>({
            keycloakifyVersion,
            prettierConfigHash,
            thisFilePath: cacheFilePath,
            uiModuleMetas
        });

        const cacheContent_new = Buffer.from(
            JSON.stringify(parsedCacheFile, null, 2),
            "utf8"
        );

        if (cacheContent !== undefined && cacheContent_new.equals(cacheContent)) {
            break update_cache;
        }

        create_dir: {
            const dirPath = pathDirname(cacheFilePath);

            if (await existsAsync(dirPath)) {
                break create_dir;
            }

            await fsPr.mkdir(dirPath, { recursive: true });
        }

        await fsPr.writeFile(cacheFilePath, cacheContent_new);
    }

    return uiModuleMetas;
}

export function computeHash(data: Buffer) {
    return crypto.createHash("sha256").update(data).digest("hex");
}
