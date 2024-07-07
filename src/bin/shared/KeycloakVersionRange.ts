export type KeycloakVersionRange =
    | KeycloakVersionRange.WithAccountV1Theme
    | KeycloakVersionRange.WithoutAccountV1Theme;

export namespace KeycloakVersionRange {
    export type WithoutAccountV1Theme = "21-and-below" | "22-and-above";

    export type WithAccountV1Theme = "21-and-below" | "23" | "24" | "25-and-above";
}
