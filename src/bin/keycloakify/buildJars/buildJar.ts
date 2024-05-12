import { assert, type Equals } from "tsafe/assert";
import { exclude } from "tsafe/exclude";
import type { KeycloakAccountV1Version, KeycloakThemeAdditionalInfoExtensionVersion } from "./extensionVersions";

export async function buildJar(params: {
    jarFileBasename: string;
    keycloakAccountV1Version: KeycloakAccountV1Version;
    keycloakThemeAdditionalInfoExtensionVersion: KeycloakThemeAdditionalInfoExtensionVersion;
    buildOptions: {
        keycloakifyBuildDirPath: string;
    };
}): Promise<void> {
    {
        const { pomFileCode } = generatePom({ buildOptions });

        fs.writeFileSync(pathJoin(buildOptions.keycloakifyBuildDirPath, "pom.xml"), Buffer.from(pomFileCode, "utf8"));
    }

    child_process.execSync("mvn clean install", { "cwd": buildOptions.keycloakifyBuildDirPath });
    // TODO: Implement
}
