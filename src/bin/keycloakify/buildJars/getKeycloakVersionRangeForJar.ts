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
                    }
                    assert<
                        Equals<typeof keycloakThemeAdditionalInfoExtensionVersion, never>
                    >(false);
                case "0.3":
                    switch (keycloakThemeAdditionalInfoExtensionVersion) {
                        case null:
                            return undefined;
                        case "1.1.5":
                            return "23" as const;
                    }
                    assert<
                        Equals<typeof keycloakThemeAdditionalInfoExtensionVersion, never>
                    >(false);
                case "0.4":
                    switch (keycloakThemeAdditionalInfoExtensionVersion) {
                        case null:
                            return undefined;
                        case "1.1.5":
                            return "24" as const;
                    }
                    assert<
                        Equals<typeof keycloakThemeAdditionalInfoExtensionVersion, never>
                    >(false);
                case "0.6":
                    switch (keycloakThemeAdditionalInfoExtensionVersion) {
                        case null:
                            return undefined;
                        case "1.1.5":
                            return "25-and-above" as const;
                    }
            }
            assert<Equals<typeof keycloakAccountV1Version, never>>(false);
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
                    return "21-and-below";
                case "1.1.5":
                    return "22-and-above";
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
