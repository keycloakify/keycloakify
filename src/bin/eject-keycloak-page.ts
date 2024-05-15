#!/usr/bin/env node

import { getThisCodebaseRootDirPath } from "./tools/getThisCodebaseRootDirPath";
import cliSelect from "cli-select";
import { loginThemePageIds, accountThemePageIds, type LoginThemePageId, type AccountThemePageId } from "./shared/pageIds";
import { capitalize } from "tsafe/capitalize";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join as pathJoin, relative as pathRelative } from "path";
import { kebabCaseToCamelCase } from "./tools/kebabCaseToSnakeCase";
import { assert, Equals } from "tsafe/assert";
import { getThemeSrcDirPath } from "./shared/getThemeSrcDirPath";
import { themeTypes, type ThemeType } from "./shared/constants";
import type { CliCommandOptions } from "./main";
import { readBuildOptions } from "./shared/buildOptions";

export async function command(params: { cliCommandOptions: CliCommandOptions }) {
    const { cliCommandOptions } = params;

    const buildOptions = readBuildOptions({
        cliCommandOptions
    });

    console.log("Select a theme type");

    const { value: themeType } = await cliSelect<ThemeType>({
        "values": [...themeTypes]
    }).catch(() => {
        console.log("Aborting");

        process.exit(-1);
    });

    console.log("Select a page you would like to eject");

    const { value: pageId } = await cliSelect<LoginThemePageId | AccountThemePageId>({
        "values": (() => {
            switch (themeType) {
                case "login":
                    return [...loginThemePageIds];
                case "account":
                    return [...accountThemePageIds];
            }
            assert<Equals<typeof themeType, never>>(false);
        })()
    }).catch(() => {
        console.log("Aborting");

        process.exit(-1);
    });

    const pageBasename = capitalize(kebabCaseToCamelCase(pageId)).replace(/ftl$/, "tsx");

    const { themeSrcDirPath } = getThemeSrcDirPath({ "reactAppRootDirPath": buildOptions.reactAppRootDirPath });

    const targetFilePath = pathJoin(themeSrcDirPath, themeType, "pages", pageBasename);

    if (existsSync(targetFilePath)) {
        console.log(`${pageId} is already ejected, ${pathRelative(process.cwd(), targetFilePath)} already exists`);

        process.exit(-1);
    }

    await writeFile(targetFilePath, await readFile(pathJoin(getThisCodebaseRootDirPath(), "src", themeType, "pages", pageBasename)));

    console.log(`${pathRelative(process.cwd(), targetFilePath)} created`);
}
