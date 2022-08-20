import type { Octokit } from "@octokit/rest";

const per_page = 99;

export function listTagsFactory(params: { octokit: Octokit }) {
    const { octokit } = params;

    const octokit_repo_listTags = async (params: { owner: string; repo: string; per_page: number; page: number }) => {
        return octokit.repos.listTags(params);
    };

    async function* listTags(params: { owner: string; repo: string }): AsyncGenerator<string> {
        const { owner, repo } = params;

        let page = 1;

        while (true) {
            const resp = await octokit_repo_listTags({
                owner,
                repo,
                per_page,
                "page": page++
            });

            for (const branch of resp.data.map(({ name }) => name)) {
                yield branch;
            }

            if (resp.data.length < 99) {
                break;
            }
        }
    }

    /** Returns the same "latest" tag as deno.land/x, not actually the latest though */
    async function getLatestTag(params: { owner: string; repo: string }): Promise<string | undefined> {
        const { owner, repo } = params;

        const itRes = await listTags({ owner, repo }).next();

        if (itRes.done) {
            return undefined;
        }

        return itRes.value;
    }

    return { listTags, getLatestTag };
}
