export type KeycloakVersionRange =
    | KeycloakVersionRange.WithAccountV1Theme
    | KeycloakVersionRange.WithoutAccountV1Theme;

export namespace KeycloakVersionRange {
    export type WithoutAccountV1Theme = "22-to-25" | "all-other-versions";

    export type WithAccountV1Theme = "21-and-below" | "23" | "24" | "25" | "26-and-above";
}
