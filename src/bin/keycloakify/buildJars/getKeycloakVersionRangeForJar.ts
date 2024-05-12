import { assert, type Equals } from "tsafe/assert";
import type { KeycloakAccountV1Versions, KeycloakThemeAdditionalInfoExtensionVersions } from "./extensionVersions";

export function getKeycloakVersionRangeForJar(params: {
    doImplementAccountTheme: boolean;
    keycloakAccountV1Version: KeycloakAccountV1Versions;
    keycloakThemeAdditionalInfoExtensionVersion: KeycloakThemeAdditionalInfoExtensionVersions;
}): string | undefined {
    const { keycloakAccountV1Version, keycloakThemeAdditionalInfoExtensionVersion, doImplementAccountTheme } = params;

    switch (keycloakAccountV1Version) {
        case null:
            switch (keycloakThemeAdditionalInfoExtensionVersion) {
                case null:
                    return doImplementAccountTheme ? "21-and-below" : "21-and-below";
                case "0.1":
                    return doImplementAccountTheme ? undefined : "22-and-above";
            }
            assert<Equals<typeof keycloakThemeAdditionalInfoExtensionVersion, never>>(false);
        case "0.3":
            switch (keycloakThemeAdditionalInfoExtensionVersion) {
                case null:
                    return doImplementAccountTheme ? undefined : undefined;
                case "0.1":
                    return doImplementAccountTheme ? "23" : undefined;
            }
            assert<Equals<typeof keycloakThemeAdditionalInfoExtensionVersion, never>>(false);
        case "0.4":
            switch (keycloakThemeAdditionalInfoExtensionVersion) {
                case null:
                    return doImplementAccountTheme ? undefined : undefined;
                case "0.1":
                    return doImplementAccountTheme ? "24-and-above" : undefined;
            }
            assert<Equals<typeof keycloakThemeAdditionalInfoExtensionVersion, never>>(false);
    }
}
