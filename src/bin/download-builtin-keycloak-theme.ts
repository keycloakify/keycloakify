import { join as pathJoin } from "path";
import { promptKeycloakVersion } from "./shared/promptKeycloakVersion";
import { readBuildOptions } from "./shared/buildOptions";
import { downloadBuiltinKeycloakTheme } from "./shared/downloadBuiltinKeycloakTheme";
import type { CliCommandOptions } from "./main";

export async function command(params: { cliCommandOptions: CliCommandOptions }) {
    const { cliCommandOptions } = params;

    const buildOptions = readBuildOptions({
        cliCommandOptions
    });

    console.log("Select the Keycloak version from which you want to download the builtins theme:");

    const { keycloakVersion } = await promptKeycloakVersion({
        "startingFromMajor": undefined,
        "cacheDirPath": buildOptions.cacheDirPath
    });

    const destDirPath = pathJoin(buildOptions.keycloakifyBuildDirPath, "src", "main", "resources", "theme");

    console.log(`Downloading builtins theme of Keycloak ${keycloakVersion} here ${destDirPath}`);

    await downloadBuiltinKeycloakTheme({
        keycloakVersion,
        destDirPath,
        buildOptions
    });
}
