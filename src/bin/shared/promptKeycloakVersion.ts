import { getLatestsSemVersionedTag } from "./getLatestsSemVersionedTag";
import cliSelect from "cli-select";
import { SemVer } from "../tools/SemVer";

export async function promptKeycloakVersion(params: {
    startingFromMajor: number | undefined;
    excludeMajorVersions: number[];
    cacheDirPath: string;
}) {
    const { startingFromMajor, excludeMajorVersions, cacheDirPath } = params;

    const semVersionedTagByMajor = new Map<number, { tag: string; version: SemVer }>();

    const semVersionedTags = await getLatestsSemVersionedTag({
        cacheDirPath,
        count: 50,
        owner: "keycloak",
        repo: "keycloak",
        doIgnoreReleaseCandidates: true
    });

    semVersionedTags.forEach(semVersionedTag => {
        if (
            startingFromMajor !== undefined &&
            semVersionedTag.version.major < startingFromMajor
        ) {
            return;
        }

        if (excludeMajorVersions.includes(semVersionedTag.version.major)) {
            return;
        }

        const currentSemVersionedTag = semVersionedTagByMajor.get(
            semVersionedTag.version.major
        );

        if (
            currentSemVersionedTag !== undefined &&
            SemVer.compare(semVersionedTag.version, currentSemVersionedTag.version) === -1
        ) {
            return;
        }

        semVersionedTagByMajor.set(semVersionedTag.version.major, semVersionedTag);
    });

    const lastMajorVersions = Array.from(semVersionedTagByMajor.values()).map(
        ({ tag }) => tag
    );

    const { value } = await cliSelect<string>({
        values: lastMajorVersions
    }).catch(() => {
        process.exit(-1);
    });

    const keycloakVersion = value.split(" ")[0];

    return { keycloakVersion };
}
