import {
    getLatestsSemVersionedTag,
    type BuildContextLike as BuildContextLike_getLatestsSemVersionedTag
} from "./getLatestsSemVersionedTag";
import cliSelect from "cli-select";
import { assert } from "tsafe/assert";
import { SemVer } from "../tools/SemVer";
import type { BuildContext } from "./buildContext";

export type BuildContextLike = BuildContextLike_getLatestsSemVersionedTag & {};

assert<BuildContext extends BuildContextLike ? true : false>();

export async function promptKeycloakVersion(params: {
    startingFromMajor: number | undefined;
    excludeMajorVersions: number[];
    doOmitPatch: boolean;
    buildContext: BuildContextLike;
}) {
    const { startingFromMajor, excludeMajorVersions, doOmitPatch, buildContext } = params;

    const semVersionedTagByMajor = new Map<number, { tag: string; version: SemVer }>();

    const semVersionedTags = await getLatestsSemVersionedTag({
        count: 50,
        owner: "keycloak",
        repo: "keycloak",
        doIgnoreReleaseCandidates: true,
        buildContext
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
        ({ version }) =>
            `${version.major}.${version.minor}${doOmitPatch ? "" : `.${version.patch}`}`
    );

    const { value } = await cliSelect<string>({
        values: lastMajorVersions
    }).catch(() => {
        process.exit(-1);
    });

    const keycloakVersion = value.split(" ")[0];

    return { keycloakVersion };
}
