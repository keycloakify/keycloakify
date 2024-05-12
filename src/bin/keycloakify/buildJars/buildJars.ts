import { assert } from "tsafe/assert";
import { exclude } from "tsafe/exclude";
import { keycloakAccountV1Versions, keycloakThemeAdditionalInfoExtensionVersions } from "./extensionVersions";
import { getKeycloakVersionRangeForJar } from "./getKeycloakVersionRangeForJar";
import { buildJar } from "./buildJar";

export async function buildJars(params: {
    doImplementAccountTheme: boolean;
    buildOptions: {
        keycloakifyBuildDirPath: string;
    };
}): Promise<{ lastJarFileBasename: string }> {
    const { doImplementAccountTheme, buildOptions } = params;

    let lastJarFileBasename: string | undefined = undefined;

    await Promise.all(
        keycloakAccountV1Versions
            .map(keycloakAccountV1Version =>
                keycloakThemeAdditionalInfoExtensionVersions
                    .map(keycloakThemeAdditionalInfoExtensionVersion => {
                        const keycloakVersionRange = getKeycloakVersionRangeForJar({
                            doImplementAccountTheme,
                            keycloakAccountV1Version,
                            keycloakThemeAdditionalInfoExtensionVersion
                        });

                        if (keycloakVersionRange === undefined) {
                            return undefined;
                        }

                        return { keycloakThemeAdditionalInfoExtensionVersion, keycloakVersionRange };
                    })
                    .filter(exclude(undefined))
                    .map(({ keycloakThemeAdditionalInfoExtensionVersion, keycloakVersionRange }) => {
                        const jarFileBasename = `keycloak-theme-for-kc-${keycloakVersionRange}.jar`;

                        lastJarFileBasename = jarFileBasename;

                        return { keycloakThemeAdditionalInfoExtensionVersion, jarFileBasename };
                    })
                    .map(({ keycloakThemeAdditionalInfoExtensionVersion, jarFileBasename }) =>
                        buildJar({
                            jarFileBasename,
                            keycloakAccountV1Version,
                            keycloakThemeAdditionalInfoExtensionVersion,
                            buildOptions
                        })
                    )
            )
            .flat()
    );

    assert(lastJarFileBasename !== undefined);

    return { lastJarFileBasename };
}
