import { join as pathJoin } from "path";
import { objectFromEntries } from "tsafe/objectFromEntries";
import * as fs from "fs";
import { type ThemeType } from "./constants";
import { getThemeSrcDirPath } from "./getThemeSrcDirPath";

export function getImplementedThemeTypes(params: { projectDirPath: string }) {
    const { projectDirPath } = params;

    const { themeSrcDirPath } = getThemeSrcDirPath({
        projectDirPath
    });

    const implementedThemeTypes: Readonly<Record<ThemeType | "email", boolean>> =
        objectFromEntries(
            (["login", "account", "email"] as const).map(themeType => [
                themeType,
                fs.existsSync(pathJoin(themeSrcDirPath, themeType))
            ])
        );

    return { implementedThemeTypes };
}
