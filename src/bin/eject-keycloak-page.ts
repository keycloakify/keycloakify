#!/usr/bin/env node

import { getProjectRoot } from "./tools/getProjectRoot";
import cliSelect from "cli-select";
import {
    loginThemePageIds,
    accountThemePageIds,
    type LoginThemePageId,
    type AccountThemePageId,
    themeTypes,
    type ThemeType
} from "./keycloakify/generateFtl/generateFtl";
import { capitalize } from "tsafe/capitalize";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join as pathJoin, relative as pathRelative } from "path";
import { kebabCaseToCamelCase } from "./tools/kebabCaseToSnakeCase";
import { assert, Equals } from "tsafe/assert";

(async () => {
    const projectRootDir = getProjectRoot();

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

    const targetFilePath = pathJoin(process.cwd(), "src", "keycloak-theme", themeType, "pages", pageBasename);

    if (existsSync(targetFilePath)) {
        console.log(`${pageId} is already ejected, ${pathRelative(process.cwd(), targetFilePath)} already exists`);

        process.exit(-1);
    }

    writeFile(targetFilePath, await readFile(pathJoin(projectRootDir, "src", "pages", themeType, pageBasename)));

    console.log(`${pathRelative(process.cwd(), targetFilePath)} created`);
})();
