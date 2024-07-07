import { assert } from "tsafe/assert";
import {
    keycloakAccountV1Versions,
    keycloakThemeAdditionalInfoExtensionVersions
} from "./extensionVersions";
import { getKeycloakVersionRangeForJar } from "./getKeycloakVersionRangeForJar";
import { buildJar, BuildContextLike as BuildContextLike_buildJar } from "./buildJar";
import type { BuildContext } from "../../shared/buildContext";

export type BuildContextLike = BuildContextLike_buildJar & {
    projectDirPath: string;
    keycloakifyBuildDirPath: string;
    recordIsImplementedByThemeType: BuildContext["recordIsImplementedByThemeType"];
    jarTargets: BuildContext["jarTargets"];
    doUseAccountV3: boolean;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export async function buildJars(params: {
    resourcesDirPath: string;
    buildContext: BuildContextLike;
}): Promise<void> {
    const { resourcesDirPath, buildContext } = params;

    const doesImplementAccountV1Theme =
        buildContext.recordIsImplementedByThemeType.account &&
        !buildContext.doUseAccountV3;

    await Promise.all(
        keycloakAccountV1Versions
            .map(keycloakAccountV1Version =>
                keycloakThemeAdditionalInfoExtensionVersions.map(
                    keycloakThemeAdditionalInfoExtensionVersion => {
                        const keycloakVersionRange = getKeycloakVersionRangeForJar({
                            doesImplementAccountV1Theme,
                            keycloakAccountV1Version,
                            keycloakThemeAdditionalInfoExtensionVersion
                        });

                        if (keycloakVersionRange === undefined) {
                            return undefined;
                        }

                        const jarTarget = buildContext.jarTargets.find(
                            jarTarget =>
                                jarTarget.keycloakVersionRange === keycloakVersionRange
                        );

                        if (jarTarget === undefined) {
                            return undefined;
                        }

                        const { jarFileBasename } = jarTarget;

                        return buildJar({
                            jarFileBasename,
                            keycloakAccountV1Version,
                            keycloakThemeAdditionalInfoExtensionVersion,
                            resourcesDirPath,
                            doesImplementAccountV1Theme,
                            buildContext
                        });
                    }
                )
            )
            .flat()
    );
}
