import { assert } from "tsafe/assert";
import { exclude } from "tsafe/exclude";
import {
    keycloakAccountV1Versions,
    keycloakThemeAdditionalInfoExtensionVersions
} from "./extensionVersions";
import { getKeycloakVersionRangeForJar } from "./getKeycloakVersionRangeForJar";
import { buildJar, BuildContextLike as BuildContextLike_buildJar } from "./buildJar";
import type { BuildContext } from "../../shared/buildContext";
import { getJarFileBasename } from "../../shared/getJarFileBasename";
import { getImplementedThemeTypes } from "../../shared/getImplementedThemeTypes";

export type BuildContextLike = BuildContextLike_buildJar & {
    projectDirPath: string;
    keycloakifyBuildDirPath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export async function buildJars(params: {
    resourcesDirPath: string;
    onlyBuildJarFileBasename: string | undefined;
    buildContext: BuildContextLike;
}): Promise<void> {
    const { onlyBuildJarFileBasename, resourcesDirPath, buildContext } = params;

    const doesImplementAccountTheme = getImplementedThemeTypes({
        projectDirPath: buildContext.projectDirPath
    }).implementedThemeTypes.account;

    await Promise.all(
        keycloakAccountV1Versions
            .map(keycloakAccountV1Version =>
                keycloakThemeAdditionalInfoExtensionVersions
                    .map(keycloakThemeAdditionalInfoExtensionVersion => {
                        const keycloakVersionRange = getKeycloakVersionRangeForJar({
                            doesImplementAccountTheme,
                            keycloakAccountV1Version,
                            keycloakThemeAdditionalInfoExtensionVersion
                        });

                        if (keycloakVersionRange === undefined) {
                            return undefined;
                        }

                        return {
                            keycloakThemeAdditionalInfoExtensionVersion,
                            keycloakVersionRange
                        };
                    })
                    .filter(exclude(undefined))
                    .map(
                        ({
                            keycloakThemeAdditionalInfoExtensionVersion,
                            keycloakVersionRange
                        }) => {
                            const { jarFileBasename } = getJarFileBasename({
                                keycloakVersionRange
                            });

                            if (
                                onlyBuildJarFileBasename !== undefined &&
                                onlyBuildJarFileBasename !== jarFileBasename
                            ) {
                                return undefined;
                            }

                            return {
                                keycloakThemeAdditionalInfoExtensionVersion,
                                jarFileBasename
                            };
                        }
                    )
                    .filter(exclude(undefined))
                    .map(
                        ({
                            keycloakThemeAdditionalInfoExtensionVersion,
                            jarFileBasename
                        }) =>
                            buildJar({
                                jarFileBasename,
                                keycloakAccountV1Version,
                                keycloakThemeAdditionalInfoExtensionVersion,
                                resourcesDirPath,
                                buildContext
                            })
                    )
            )
            .flat()
    );
}
