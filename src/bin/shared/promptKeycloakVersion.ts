import { getLatestsSemVersionedTagFactory } from "../tools/octokit-addons/getLatestsSemVersionedTag";
import { Octokit } from "@octokit/rest";
import cliSelect from "cli-select";
import { SemVer } from "../tools/SemVer";

export async function promptKeycloakVersion(params: { startingFromMajor: number | undefined }) {
    const { startingFromMajor } = params;

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

    (
        await getLatestsSemVersionedTag({
            "count": 50,
            "owner": "keycloak",
            "repo": "keycloak"
        })
    ).forEach(semVersionedTag => {
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
