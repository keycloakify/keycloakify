import { getLatestsSemVersionedTagFactory } from "../tools/octokit-addons/getLatestsSemVersionedTag";
import { Octokit } from "@octokit/rest";
import type { ReturnType } from "tsafe";
import type { Param0 } from "tsafe";
import { join as pathJoin, dirname as pathDirname } from "path";
import * as fs from "fs";
import { z } from "zod";
import { assert, type Equals } from "tsafe/assert";
import { id } from "tsafe/id";
import type { SemVer } from "../tools/SemVer";
import { same } from "evt/tools/inDepth/same";

type GetLatestsSemVersionedTag = ReturnType<
    typeof getLatestsSemVersionedTagFactory
>["getLatestsSemVersionedTag"];

type Params = Param0<GetLatestsSemVersionedTag>;
type R = ReturnType<GetLatestsSemVersionedTag>;

let getLatestsSemVersionedTag_stateless: GetLatestsSemVersionedTag | undefined =
    undefined;

const CACHE_VERSION = 1;

type Cache = {
    version: typeof CACHE_VERSION;
    entries: {
        time: number;
        params: Params;
        result: R;
    }[];
};

export async function getLatestsSemVersionedTag({
    cacheDirPath,
    ...params
}: Params & { cacheDirPath: string }): Promise<R> {
    const cacheFilePath = pathJoin(cacheDirPath, "latest-sem-versioned-tags.json");

    const cacheLookupResult = (() => {
        const getResult_currentCache = (currentCacheEntries: Cache["entries"]) => ({
            hasCachedResult: false as const,
            currentCache: {
                version: CACHE_VERSION,
                entries: currentCacheEntries
            }
        });

        if (!fs.existsSync(cacheFilePath)) {
            return getResult_currentCache([]);
        }

        let cache_json;

        try {
            cache_json = fs.readFileSync(cacheFilePath).toString("utf8");
        } catch {
            return getResult_currentCache([]);
        }

        let cache_json_parsed: unknown;

        try {
            cache_json_parsed = JSON.parse(cache_json);
        } catch {
            return getResult_currentCache([]);
        }

        const zSemVer = (() => {
            type TargetType = SemVer;

            const zTargetType = z.object({
                major: z.number(),
                minor: z.number(),
                patch: z.number(),
                rc: z.number().optional(),
                parsedFrom: z.string()
            });

            assert<Equals<z.infer<typeof zTargetType>, TargetType>>();

            return id<z.ZodType<TargetType>>(zTargetType);
        })();

        const zCache = (() => {
            type TargetType = Cache;

            const zTargetType = z.object({
                version: z.literal(CACHE_VERSION),
                entries: z.array(
                    z.object({
                        time: z.number(),
                        params: z.object({
                            owner: z.string(),
                            repo: z.string(),
                            count: z.number(),
                            doIgnoreReleaseCandidates: z.boolean()
                        }),
                        result: z.array(
                            z.object({
                                tag: z.string(),
                                version: zSemVer
                            })
                        )
                    })
                )
            });

            assert<Equals<z.infer<typeof zTargetType>, TargetType>>();

            return id<z.ZodType<TargetType>>(zTargetType);
        })();

        let cache: Cache;

        try {
            cache = zCache.parse(cache_json_parsed);
        } catch {
            return getResult_currentCache([]);
        }

        const cacheEntry = cache.entries.find(e => same(e.params, params));

        if (cacheEntry === undefined) {
            return getResult_currentCache(cache.entries);
        }

        if (Date.now() - cacheEntry.time > 3_600_000) {
            return getResult_currentCache(cache.entries.filter(e => e !== cacheEntry));
        }
        return {
            hasCachedResult: true as const,
            cachedResult: cacheEntry.result
        };
    })();

    if (cacheLookupResult.hasCachedResult) {
        return cacheLookupResult.cachedResult;
    }

    const { currentCache } = cacheLookupResult;

    getLatestsSemVersionedTag_stateless ??= (() => {
        const octokit = (() => {
            const githubToken = process.env.GITHUB_TOKEN;

            const octokit = new Octokit(
                githubToken === undefined ? undefined : { auth: githubToken }
            );

            return octokit;
        })();

        const { getLatestsSemVersionedTag } = getLatestsSemVersionedTagFactory({
            octokit
        });

        return getLatestsSemVersionedTag;
    })();

    const result = await getLatestsSemVersionedTag_stateless(params);

    currentCache.entries.push({
        time: Date.now(),
        params,
        result
    });

    {
        const dirPath = pathDirname(cacheFilePath);

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    fs.writeFileSync(cacheFilePath, JSON.stringify(currentCache, null, 2));

    return result;
}
