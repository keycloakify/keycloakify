import { getLatestsSemVersionedTagFactory } from "./tools/octokit-addons/getLatestsSemVersionedTag";
import { Octokit } from "@octokit/rest";
import cliSelect from "cli-select";
import { lastKeycloakVersionWithAccountV1 } from "./constants";

export async function promptKeycloakVersion() {
    const { getLatestsSemVersionedTag } = (() => {
        const { octokit } = (() => {
            const githubToken = process.env.GITHUB_TOKEN;

            const octokit = new Octokit(githubToken === undefined ? undefined : { "auth": githubToken });

            return { octokit };
        })();

        const { getLatestsSemVersionedTag } = getLatestsSemVersionedTagFactory({ octokit });

        return { getLatestsSemVersionedTag };
    })();

    console.log("Select Keycloak version?");

    const tags = [
        ...(await getLatestsSemVersionedTag({
            "count": 10,
            "owner": "keycloak",
            "repo": "keycloak"
        }).then(arr => arr.map(({ tag }) => tag))),
        lastKeycloakVersionWithAccountV1,
        "11.0.3"
    ];

    if (process.env["GITHUB_ACTIONS"] === "true") {
        return { "keycloakVersion": tags[0] };
    }

    const { value: keycloakVersion } = await cliSelect<string>({
        "values": tags
    }).catch(() => {
        console.log("Aborting");

        process.exit(-1);
    });

    console.log(keycloakVersion);

    return { keycloakVersion };
}
