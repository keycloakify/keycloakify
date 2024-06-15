import { join as pathJoin } from "path";
import { objectFromEntries } from "tsafe/objectFromEntries";
import * as fs from "fs";
import { type ThemeType } from "./constants";
import { getThemeSrcDirPath } from "./getThemeSrcDirPath";

type ImplementedThemeTypes = Readonly<Record<ThemeType | "email", boolean>>;

let cache:
    | { projectDirPath: string; implementedThemeTypes: ImplementedThemeTypes }
    | undefined;

export function getImplementedThemeTypes(params: { projectDirPath: string }) {
    const { projectDirPath } = params;

    if (cache !== undefined && cache.projectDirPath === projectDirPath) {
        const { implementedThemeTypes } = cache;
        return { implementedThemeTypes };
    }

    cache = undefined;

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

    cache = { projectDirPath, implementedThemeTypes };

    return { implementedThemeTypes };
}
