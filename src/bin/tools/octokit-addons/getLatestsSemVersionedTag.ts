import { listTagsFactory } from "./listTags";
import type { Octokit } from "@octokit/rest";
import { SemVer } from "../SemVer";

export function getLatestsSemVersionedTagFactory(params: { octokit: Octokit }) {
    const { octokit } = params;

    async function getLatestsSemVersionedTag(params: {
        owner: string;
        repo: string;
        count: number;
        doIgnoreReleaseCandidates: boolean;
    }): Promise<
        {
            tag: string;
            version: SemVer;
        }[]
    > {
        const { owner, repo, count, doIgnoreReleaseCandidates } = params;

        const semVersionedTags: { tag: string; version: SemVer }[] = [];

        const { listTags } = listTagsFactory({ octokit });

        for await (const tag of listTags({ owner, repo })) {
            let version: SemVer;

            try {
                version = SemVer.parse(tag.replace(/^[vV]?/, ""));
            } catch {
                continue;
            }

            if (doIgnoreReleaseCandidates && version.rc !== undefined) {
                continue;
            }

            semVersionedTags.push({ tag, version });
        }

        return semVersionedTags
            .sort(({ version: vX }, { version: vY }) => SemVer.compare(vY, vX))
            .slice(0, count);
    }

    return { getLatestsSemVersionedTag };
}
