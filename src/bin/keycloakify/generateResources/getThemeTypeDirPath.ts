import { ThemeType } from "../../shared/constants";
import { join } from "path";

export const getThemeTypeDirPath = (params: {
    resourcesDirPath: string;
    themeType: ThemeType | "email";
    themeName: string;
}) => {
    const { themeType, themeName, resourcesDirPath } = params;
    return join(resourcesDirPath, "theme", themeName, themeType);
};
