import { assert, type Equals } from "tsafe/assert";
import { exclude } from "tsafe/exclude";
import type { KeycloakAccountV1Versions, KeycloakThemeAdditionalInfoExtensionVersions } from "./extensionVersions";

export async function buildJar(params: {
    jarFileBasename: string;
    keycloakAccountV1Version: KeycloakAccountV1Versions;
    keycloakThemeAdditionalInfoExtensionVersion: KeycloakThemeAdditionalInfoExtensionVersions;
    buildOptions: {
        keycloakifyBuildDirPath: string;
    };
}): Promise<void> {
    child_process.execSync("mvn clean install", { "cwd": buildOptions.keycloakifyBuildDirPath });
    // TODO: Implement
}
