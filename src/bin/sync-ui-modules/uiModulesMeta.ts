import { assert, type Equals } from "tsafe/assert";
import { id } from "tsafe/id";
import { z } from "zod";
import { join as pathJoin } from "path";
import * as fsPr from "fs/promises";
import type { BuildContext } from "../shared/buildContext";
import { is } from "tsafe/is";
import { existsAsync } from "../tools/fs.existsAsync";
import { listInstalledModules } from "../tools/listInstalledModules";
import { crawlAsync } from "../tools/crawlAsync";
import { getIsPrettierAvailable, getPrettierAndConfig } from "../tools/runPrettier";
import { readThisNpmPackageVersion } from "../tools/readThisNpmPackageVersion";
import {
    getSourceCodeToCopyInUserCodebase,
    type BuildContextLike as BuildContextLike_getSourceCodeToCopyInUserCodebase
} from "./getSourceCodeToCopyInUserCodebase";
import * as crypto from "crypto";

export type UiModulesMeta = {
    keycloakifyVersion: string;
    prettierConfigHash: string | null;
    entries: UiModulesMeta.Entry[];
};

export namespace UiModulesMeta {
    export type Entry = {
        moduleName: string;
        version: string;
        files: {
            fileRelativePath: string;
            hash: string;
        }[];
    };
}

const zUiModuleMetasEntry = (() => {
    type ExpectedType = UiModulesMeta.Entry;

    const zTargetType = z.object({
        moduleName: z.string(),
        version: z.string(),
        files: z.array(
            z.object({
                fileRelativePath: z.string(),
                hash: z.string()
            })
        )
    });

    type InferredType = z.infer<typeof zTargetType>;

    assert<Equals<InferredType, ExpectedType>>();

    return id<z.ZodType<ExpectedType>>(zTargetType);
})();

const zUiModulesMeta = (() => {
    type ExpectedType = UiModulesMeta;

    const zTargetType = z.object({
        keycloakifyVersion: z.string(),
        prettierConfigHash: z.union([z.string(), z.null()]),
        entries: z.array(zUiModuleMetasEntry)
    });

    type InferredType = z.infer<typeof zTargetType>;

    assert<Equals<InferredType, ExpectedType>>();

    return id<z.ZodType<ExpectedType>>(zTargetType);
})();

const RELATIVE_FILE_PATH = pathJoin("uiModulesMeta.json");

export type BuildContextLike = BuildContextLike_getSourceCodeToCopyInUserCodebase & {
    cacheDirPath: string;
    packageJsonFilePath: string;
    projectDirPath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export async function readOrCreateUiModulesMeta(params: {
    buildContext: BuildContextLike;
}): Promise<UiModulesMeta> {
    const { buildContext } = params;

    const filePath = pathJoin(buildContext.cacheDirPath, RELATIVE_FILE_PATH);

    const keycloakifyVersion = readThisNpmPackageVersion();

    const prettierConfigHash = await (async () => {
        if (!(await getIsPrettierAvailable())) {
            return null;
        }

        const { config } = await getPrettierAndConfig();

        return crypto.createHash("sha256").update(JSON.stringify(config)).digest("hex");
    })();

    const installedUiModules = await listInstalledModules({
        packageJsonFilePath: buildContext.packageJsonFilePath,
        projectDirPath: buildContext.packageJsonFilePath,
        filter: ({ moduleName }) =>
            moduleName.includes("keycloakify") && moduleName.endsWith("-ui")
    });

    const upToDateEntries: UiModulesMeta.Entry[] = await (async () => {
        const uiModulesMeta_cache: UiModulesMeta | undefined = await (async () => {
            if (!(await existsAsync(filePath))) {
                return undefined;
            }

            const contentStr = (await fsPr.readFile(filePath)).toString("utf8");

            let uiModuleMeta: unknown;

            try {
                uiModuleMeta = JSON.parse(contentStr);
            } catch {
                return undefined;
            }

            try {
                zUiModulesMeta.parse(uiModuleMeta);
            } catch {
                return undefined;
            }

            assert(is<UiModulesMeta>(uiModuleMeta));

            return uiModuleMeta;
        })();

        if (uiModulesMeta_cache === undefined) {
            return [];
        }

        if (uiModulesMeta_cache.keycloakifyVersion !== keycloakifyVersion) {
            return [];
        }

        if (uiModulesMeta_cache.prettierConfigHash !== prettierConfigHash) {
            return [];
        }

        const upToDateEntries = uiModulesMeta_cache.entries.filter(entry => {
            const correspondingInstalledUiModule = installedUiModules.find(
                installedUiModule => installedUiModule.moduleName === entry.moduleName
            );

            if (correspondingInstalledUiModule === undefined) {
                return false;
            }

            return correspondingInstalledUiModule.version === entry.version;
        });

        return upToDateEntries;
    })();

    const entries = await Promise.all(
        installedUiModules.map(
            async ({ moduleName, version, dirPath }): Promise<UiModulesMeta.Entry> => {
                use_cache: {
                    const cachedEntry = upToDateEntries.find(
                        entry => entry.moduleName === moduleName
                    );

                    if (cachedEntry === undefined) {
                        break use_cache;
                    }

                    return cachedEntry;
                }

                const files: UiModulesMeta.Entry["files"] = [];

                {
                    const srcDirPath = pathJoin(dirPath, "src");

                    await crawlAsync({
                        dirPath: srcDirPath,
                        returnedPathsType: "relative to dirPath",
                        onFileFound: async fileRelativePath => {
                            const sourceCode = await getSourceCodeToCopyInUserCodebase({
                                buildContext,
                                relativeFromDirPath: srcDirPath,
                                fileRelativePath,
                                commentData: {
                                    isForEjection: false,
                                    uiModuleName: moduleName,
                                    uiModuleVersion: version
                                }
                            });

                            const hash = crypto
                                .createHash("sha256")
                                .update(sourceCode)
                                .digest("hex");

                            files.push({
                                fileRelativePath,
                                hash
                            });
                        }
                    });
                }

                return id<UiModulesMeta.Entry>({
                    files,
                    moduleName,
                    version
                });
            }
        )
    );

    return id<UiModulesMeta>({
        keycloakifyVersion,
        prettierConfigHash,
        entries
    });
}
