#!/usr/bin/env node

import * as fs from "fs";
import { join as pathJoin, basename as pathBasename } from "path";
import { keycloakThemeBuildingDirPath } from "./build-keycloak-theme";
import child_process from "child_process";

if (!fs.existsSync(keycloakThemeBuildingDirPath)) {
    console.log("Error: The keycloak theme need to be build");
    process.exit(1);
}

const url = "https://github.com/garronej/keycloak-react-theming/releases/download/v0.0.1/other_keycloak_thems.zip";

[
    `wget ${url}`,
    ...["unzip", "rm"].map(prg => `${prg} ${pathBasename(url)}`),
].forEach(cmd => child_process.execSync(cmd, { "cwd": pathJoin(keycloakThemeBuildingDirPath, "src", "main", "resources", "theme") }));
