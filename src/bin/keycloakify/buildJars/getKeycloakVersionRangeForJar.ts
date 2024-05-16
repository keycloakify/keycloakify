import { assert, type Equals } from "tsafe/assert";
import type { KeycloakAccountV1Version, KeycloakThemeAdditionalInfoExtensionVersion } from "./extensionVersions";
import { id } from "tsafe/id";

export type KeycloakVersionRange = KeycloakVersionRange.WithAccountTheme | KeycloakVersionRange.WithoutAccountTheme;

export namespace KeycloakVersionRange {
    export type WithoutAccountTheme = "21-and-below" | "22-and-above";

    export type WithAccountTheme = "21-and-below" | "23" | "24-and-above";
}

export function getKeycloakVersionRangeForJar(params: {
    doesImplementAccountTheme: boolean;
    keycloakAccountV1Version: KeycloakAccountV1Version;
    keycloakThemeAdditionalInfoExtensionVersion: KeycloakThemeAdditionalInfoExtensionVersion;
}): KeycloakVersionRange | undefined {
    const { keycloakAccountV1Version, keycloakThemeAdditionalInfoExtensionVersion, doesImplementAccountTheme } = params;

    if (doesImplementAccountTheme) {
        return id<KeycloakVersionRange.WithAccountTheme | undefined>(
            (() => {
                switch (keycloakAccountV1Version) {
                    case null:
                        switch (keycloakThemeAdditionalInfoExtensionVersion) {
                            case null:
                                return "21-and-below" as const;
                            case "1.1.5":
                                return undefined;
                        }
                        assert<Equals<typeof keycloakThemeAdditionalInfoExtensionVersion, never>>(false);
                    case "0.3":
                        switch (keycloakThemeAdditionalInfoExtensionVersion) {
                            case null:
                                return undefined;
                            case "1.1.5":
                                return "23" as const;
                        }
                        assert<Equals<typeof keycloakThemeAdditionalInfoExtensionVersion, never>>(false);
                    case "0.4":
                        switch (keycloakThemeAdditionalInfoExtensionVersion) {
                            case null:
                                return undefined;
                            case "1.1.5":
                                return "24-and-above" as const;
                        }
                        assert<Equals<typeof keycloakThemeAdditionalInfoExtensionVersion, never>>(false);
                }
            })()
        );
    } else {
        return id<KeycloakVersionRange.WithoutAccountTheme | undefined>(
            (() => {
                switch (keycloakAccountV1Version) {
                    case null:
                        switch (keycloakThemeAdditionalInfoExtensionVersion) {
                            case null:
                                return "21-and-below";
                            case "1.1.5":
                                return "22-and-above";
                        }
                        assert<Equals<typeof keycloakThemeAdditionalInfoExtensionVersion, never>>(false);
                    case "0.3":
                        switch (keycloakThemeAdditionalInfoExtensionVersion) {
                            case null:
                                return undefined;
                            case "1.1.5":
                                return undefined;
                        }
                        assert<Equals<typeof keycloakThemeAdditionalInfoExtensionVersion, never>>(false);
                    case "0.4":
                        switch (keycloakThemeAdditionalInfoExtensionVersion) {
                            case null:
                                return undefined;
                            case "1.1.5":
                                return undefined;
                        }
                        assert<Equals<typeof keycloakThemeAdditionalInfoExtensionVersion, never>>(false);
                }
            })()
        );
    }
}
