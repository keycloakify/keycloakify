import { assert, type Equals } from "tsafe/assert";
import type {
    KeycloakAccountV1Version,
    KeycloakThemeAdditionalInfoExtensionVersion
} from "./extensionVersions";
import type { KeycloakVersionRange } from "../../shared/KeycloakVersionRange";

export function getKeycloakVersionRangeForJar(params: {
    doesImplementAccountV1Theme: boolean;
    keycloakAccountV1Version: KeycloakAccountV1Version;
    keycloakThemeAdditionalInfoExtensionVersion: KeycloakThemeAdditionalInfoExtensionVersion;
}): KeycloakVersionRange | undefined {
    const {
        keycloakAccountV1Version,
        keycloakThemeAdditionalInfoExtensionVersion,
        doesImplementAccountV1Theme
    } = params;

    if (doesImplementAccountV1Theme) {
        const keycloakVersionRange = (() => {
            switch (keycloakAccountV1Version) {
                case null:
                    switch (keycloakThemeAdditionalInfoExtensionVersion) {
                        case null:
                            return "21-and-below" as const;
                        case "1.1.5":
                            return undefined;
                        default:
                            assert<
                                Equals<
                                    typeof keycloakThemeAdditionalInfoExtensionVersion,
                                    never
                                >
                            >(false);
                    }
                case "0.3":
                    switch (keycloakThemeAdditionalInfoExtensionVersion) {
                        case null:
                            return undefined;
                        case "1.1.5":
                            return "23" as const;
                        default:
                            assert<
                                Equals<
                                    typeof keycloakThemeAdditionalInfoExtensionVersion,
                                    never
                                >
                            >(false);
                    }
                case "0.4":
                    switch (keycloakThemeAdditionalInfoExtensionVersion) {
                        case null:
                            return undefined;
                        case "1.1.5":
                            return "24" as const;
                        default:
                            assert<
                                Equals<
                                    typeof keycloakThemeAdditionalInfoExtensionVersion,
                                    never
                                >
                            >(false);
                    }
                case "0.6":
                    switch (keycloakThemeAdditionalInfoExtensionVersion) {
                        case null:
                            return "26.0-to-26.1" as const;
                        case "1.1.5":
                            return "25" as const;
                        default:
                            assert<
                                Equals<
                                    typeof keycloakThemeAdditionalInfoExtensionVersion,
                                    never
                                >
                            >(false);
                    }
                case "0.7":
                    switch (keycloakThemeAdditionalInfoExtensionVersion) {
                        case null:
                            return "26.2-and-above" as const;
                        case "1.1.5":
                            return undefined;
                        default:
                            assert<
                                Equals<
                                    typeof keycloakThemeAdditionalInfoExtensionVersion,
                                    never
                                >
                            >(false);
                    }
                default:
                    assert<Equals<typeof keycloakAccountV1Version, never>>(false);
            }
        })();

        assert<
            Equals<
                typeof keycloakVersionRange,
                KeycloakVersionRange.WithAccountV1Theme | undefined
            >
        >();

        return keycloakVersionRange;
    } else {
        const keycloakVersionRange = (() => {
            if (keycloakAccountV1Version !== null) {
                return undefined;
            }
            switch (keycloakThemeAdditionalInfoExtensionVersion) {
                case null:
                    return "all-other-versions";
                case "1.1.5":
                    return "22-to-25";
            }
            assert<Equals<typeof keycloakThemeAdditionalInfoExtensionVersion, never>>(
                false
            );
        })();

        assert<
            Equals<
                typeof keycloakVersionRange,
                KeycloakVersionRange.WithoutAccountV1Theme | undefined
            >
        >();

        return keycloakVersionRange;
    }
}
