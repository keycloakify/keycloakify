#!/usr/bin/env node

import { getProjectRoot } from "./tools/getProjectRoot";
import cliSelect from "cli-select";
import { loginThemePageIds, type PageId } from "./keycloakify/generateFtl/generateFtl";
import { capitalize } from "tsafe/capitalize";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join as pathJoin, relative as pathRelative } from "path";
import { kebabCaseToCamelCase } from "./tools/kebabCaseToSnakeCase";

(async () => {
    const projectRootDir = getProjectRoot();

    const { value: pageId } = await cliSelect<PageId>({
        "values": [...loginThemePageIds]
    }).catch(() => {
        console.log("Aborting");

        process.exit(-1);
    });

    const pageBasename = `${capitalize(kebabCaseToCamelCase(pageId))}.tsx`;

    console.log(pageId);

    const targetFilePath = pathJoin(process.cwd(), "src", "keycloak-theme", "pages", pageBasename);

    if (existsSync(targetFilePath)) {
        console.log(`${pageId} is already ejected, ${pathRelative(process.cwd(), targetFilePath)} already exists`);

        process.exit(-1);
    }

    writeFile(targetFilePath, await readFile(pathJoin(projectRootDir, "src", "pages", pageBasename)));

    console.log(`${pathRelative(process.cwd(), targetFilePath)} created`);
})();
