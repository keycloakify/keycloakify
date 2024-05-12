import type { ThemeType } from "../../constants";

export function generateThemeVariations(params: {
    themeName: string;
    themeVariantName: string;
    implementedThemeTypes: Record<ThemeType | "email", boolean>;
    buildOptions: {
        keycloakifyBuildDirPath: string;
    };
}) {
    //TODO: Implement
}
