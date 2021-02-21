import { generateKeycloakThemeResources } from "./generateKeycloakThemeResources";
import { generateJavaStackFiles } from "./generateJavaStackFiles";
import type { ParsedPackageJson } from "./generateJavaStackFiles";
import { join as pathJoin } from "path";
import * as child_process from "child_process";
import { generateDebugFiles } from "./generateDebugFiles";

const reactProjectDirPath = process.cwd();

const parsedPackageJson: ParsedPackageJson = require(pathJoin(reactProjectDirPath, "package.json"));

export const keycloakThemeBuildingDirPath = pathJoin(reactProjectDirPath, "build_keycloak");

if (require.main === module) {

    generateKeycloakThemeResources({
        keycloakThemeBuildingDirPath,
        "reactAppBuildDirPath": pathJoin(reactProjectDirPath, "build"),
        "themeName": parsedPackageJson.name
    });

    generateJavaStackFiles({
        parsedPackageJson,
        keycloakThemeBuildingDirPath
    });

    child_process.execSync(
        "mvn package",
        { "cwd": keycloakThemeBuildingDirPath }
    );

    generateDebugFiles({
        keycloakThemeBuildingDirPath,
        "packageJsonName": parsedPackageJson.name
    });

}
