export type KeycloakVersionRange =
    | KeycloakVersionRange.WithAccountTheme
    | KeycloakVersionRange.WithoutAccountTheme;

export namespace KeycloakVersionRange {
    export type WithoutAccountTheme = "21-and-below" | "22-and-above";

    export type WithAccountTheme = "21-and-below" | "23" | "24-and-above";
}
