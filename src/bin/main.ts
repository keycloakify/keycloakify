import { generateKeycloakThemeResources } from "./generateKeycloakThemeResources";
import { generateJavaStackFiles } from "./generateJavaStackFiles";
import type { ParsedPackageJson } from "./generateJavaStackFiles";
import { join as pathJoin } from "path";

const reactProjectDirPath = process.cwd();

const parsedPackageJson: ParsedPackageJson = require(pathJoin(reactProjectDirPath, "package.json"));

const keycloakThemeBuildingDirPath = pathJoin(reactProjectDirPath, "build_keycloak");

generateKeycloakThemeResources({
    keycloakThemeBuildingDirPath,
    "reactAppBuildDirPath": pathJoin(reactProjectDirPath, "build"),
    "themeName": parsedPackageJson.name
});

generateJavaStackFiles({
    parsedPackageJson,
    keycloakThemeBuildingDirPath
});

