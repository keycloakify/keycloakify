import { Octokit } from "@octokit/rest";

export function createOctokit(params: { github_token: string }) {
    const { github_token } = params;

    return new Octokit({ ...(github_token !== "" ? { "auth": github_token } : {}) });
}
