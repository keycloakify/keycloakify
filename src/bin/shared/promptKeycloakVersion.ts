import { getLatestsSemVersionedTagFactory } from "../tools/octokit-addons/getLatestsSemVersionedTag";
import { Octokit } from "@octokit/rest";
import cliSelect from "cli-select";
import { SemVer } from "../tools/SemVer";
import { join as pathJoin } from "path";
import * as fs from "fs";
import type { ReturnType } from "tsafe";
import { id } from "tsafe/id";

export async function promptKeycloakVersion(params: { startingFromMajor: number | undefined; cacheDirPath: string }) {
    const { startingFromMajor, cacheDirPath } = params;

    const { getLatestsSemVersionedTag } = (() => {
        const { octokit } = (() => {
            const githubToken = process.env.GITHUB_TOKEN;

            const octokit = new Octokit(githubToken === undefined ? undefined : { "auth": githubToken });

            return { octokit };
        })();

        const { getLatestsSemVersionedTag } = getLatestsSemVersionedTagFactory({ octokit });

        return { getLatestsSemVersionedTag };
    })();

    const semVersionedTagByMajor = new Map<number, { tag: string; version: SemVer }>();

    const semVersionedTags = await (async () => {
        const cacheFilePath = pathJoin(cacheDirPath, "keycloak-versions.json");

        type Cache = {
            time: number;
            semVersionedTags: ReturnType<typeof getLatestsSemVersionedTag>;
        };

        use_cache: {
            if (!fs.existsSync(cacheFilePath)) {
                break use_cache;
            }

            const cache: Cache = JSON.parse(fs.readFileSync(cacheFilePath).toString("utf8"));

            if (Date.now() - cache.time > 3_600_000) {
                fs.unlinkSync(cacheFilePath);
                break use_cache;
            }

            return cache.semVersionedTags;
        }

        const semVersionedTags = await getLatestsSemVersionedTag({
            "count": 50,
            "owner": "keycloak",
            "repo": "keycloak"
        });

        fs.writeFileSync(
            cacheFilePath,
            JSON.stringify(
                id<Cache>({
                    "time": Date.now(),
                    semVersionedTags
                }),
                null,
                2
            )
        );

        return semVersionedTags;
    })();

    semVersionedTags.forEach(semVersionedTag => {
        if (startingFromMajor !== undefined && semVersionedTag.version.major < startingFromMajor) {
            return;
        }

        const currentSemVersionedTag = semVersionedTagByMajor.get(semVersionedTag.version.major);

        if (currentSemVersionedTag !== undefined && SemVer.compare(semVersionedTag.version, currentSemVersionedTag.version) === -1) {
            return;
        }

        semVersionedTagByMajor.set(semVersionedTag.version.major, semVersionedTag);
    });

    const lastMajorVersions = Array.from(semVersionedTagByMajor.values()).map(({ tag }) => tag);

    const { value } = await cliSelect<string>({
        "values": lastMajorVersions
    }).catch(() => {
        console.log("Aborting");

        process.exit(-1);
    });

    const keycloakVersion = value.split(" ")[0];

    return { keycloakVersion };
}
