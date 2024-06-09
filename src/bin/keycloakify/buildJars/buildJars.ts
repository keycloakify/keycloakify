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
import { readMetaInfKeycloakThemes } from "../../shared/metaInfKeycloakThemes";
import { accountV1ThemeName } from "../../shared/constants";

export type BuildContextLike = BuildContextLike_buildJar & {
    keycloakifyBuildDirPath: string;
};

assert<BuildContext extends BuildContextLike ? true : false>();

export async function buildJars(params: {
    buildContext: BuildContextLike;
}): Promise<void> {
    const { buildContext } = params;

    const doesImplementAccountTheme = readMetaInfKeycloakThemes({
        keycloakifyBuildDirPath: buildContext.keycloakifyBuildDirPath
    }).themes.some(({ name }) => name === accountV1ThemeName);

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

                            return {
                                keycloakThemeAdditionalInfoExtensionVersion,
                                jarFileBasename
                            };
                        }
                    )
                    .map(
                        ({
                            keycloakThemeAdditionalInfoExtensionVersion,
                            jarFileBasename
                        }) =>
                            buildJar({
                                jarFileBasename,
                                keycloakAccountV1Version,
                                keycloakThemeAdditionalInfoExtensionVersion,
                                buildContext
                            })
                    )
            )
            .flat()
    );
}
