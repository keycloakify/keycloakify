import { assert, type Equals } from "tsafe/assert";
import type { KeycloakAccountV1Version, KeycloakThemeAdditionalInfoExtensionVersion } from "./extensionVersions";

export function getKeycloakVersionRangeForJar(params: {
    doesImplementAccountTheme: boolean;
    keycloakAccountV1Version: KeycloakAccountV1Version;
    keycloakThemeAdditionalInfoExtensionVersion: KeycloakThemeAdditionalInfoExtensionVersion;
}): string | undefined {
    const { keycloakAccountV1Version, keycloakThemeAdditionalInfoExtensionVersion, doesImplementAccountTheme } = params;

    switch (keycloakAccountV1Version) {
        case null:
            switch (keycloakThemeAdditionalInfoExtensionVersion) {
                case null:
                    return doesImplementAccountTheme ? "21-and-below" : "21-and-below";
                case "1.1.5":
                    return doesImplementAccountTheme ? undefined : "22-and-above";
            }
            assert<Equals<typeof keycloakThemeAdditionalInfoExtensionVersion, never>>(false);
        case "0.3":
            switch (keycloakThemeAdditionalInfoExtensionVersion) {
                case null:
                    return doesImplementAccountTheme ? undefined : undefined;
                case "1.1.5":
                    return doesImplementAccountTheme ? "23" : undefined;
            }
            assert<Equals<typeof keycloakThemeAdditionalInfoExtensionVersion, never>>(false);
        case "0.4":
            switch (keycloakThemeAdditionalInfoExtensionVersion) {
                case null:
                    return doesImplementAccountTheme ? undefined : undefined;
                case "1.1.5":
                    return doesImplementAccountTheme ? "24-and-above" : undefined;
            }
            assert<Equals<typeof keycloakThemeAdditionalInfoExtensionVersion, never>>(false);
    }
}
