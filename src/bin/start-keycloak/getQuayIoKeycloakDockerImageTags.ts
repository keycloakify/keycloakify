import fetch from "make-fetch-happen";
import type { BuildContext } from "../shared/buildContext";
import { assert } from "tsafe/assert";
import { z } from "zod";
import { SemVer } from "../tools/SemVer";
import { exclude } from "tsafe/exclude";
import { getSupportedKeycloakMajorVersions } from "./realmConfig/defaultConfig";

export type BuildContextLike = {
    fetchOptions: BuildContext["fetchOptions"];
};

assert<BuildContext extends BuildContextLike ? true : false>;

let cache: string[] | undefined = undefined;

export async function getKeycloakDockerImageLatestSemVerTagsForEveryMajors(params: {
    buildContext: BuildContextLike;
}) {
    if (cache !== undefined) {
        return cache;
    }

    const { buildContext } = params;

    const { tags } = await fetch(
        "https://quay.io/v2/keycloak/keycloak/tags/list",
        buildContext.fetchOptions
    )
        .then(r => r.json())
        .then(j =>
            z
                .object({
                    tags: z.array(z.string())
                })
                .parse(j)
        );

    const arr = tags
        .map(tag => ({
            tag,
            version: (() => {
                if (tag.includes("-")) {
                    return undefined;
                }

                let version: SemVer;

                try {
                    version = SemVer.parse(tag);
                } catch {
                    return undefined;
                }

                return version;
            })()
        }))
        .map(({ tag, version }) => (version === undefined ? undefined : { tag, version }))
        .filter(exclude(undefined));

    const versionByMajor: Record<number, SemVer | undefined> = {};

    for (const { version } of arr) {
        const version_current = versionByMajor[version.major];

        if (
            version_current === undefined ||
            SemVer.compare(version_current, version) === -1
        ) {
            versionByMajor[version.major] = version;
        }
    }

    const supportedKeycloakMajorVersions = getSupportedKeycloakMajorVersions();

    cache = Object.values(versionByMajor)
        .map(version => {
            assert(version !== undefined);

            if (!supportedKeycloakMajorVersions.includes(version.major)) {
                return undefined;
            }

            return SemVer.stringify(version);
        })
        .filter(exclude(undefined));

    return cache;
}
