import { join as pathJoin } from "path";
import { promptKeycloakVersion } from "./shared/promptKeycloakVersion";
import { readBuildOptions } from "./shared/buildOptions";
import { downloadBuiltinKeycloakTheme } from "./shared/downloadBuiltinKeycloakTheme";
import type { CliCommandOptions } from "./main";
import { getLogger } from "./tools/logger";

export async function command(params: { cliCommandOptions: CliCommandOptions }) {
    const { cliCommandOptions } = params;

    const buildOptions = readBuildOptions({
        cliCommandOptions
    });

    const { log } = getLogger({ "isSilent": buildOptions.isSilent });

    console.log("Select the Keycloak version from which you want to download the builtins theme:");

    const { keycloakVersion } = await promptKeycloakVersion({
        "startingFromMajor": undefined
    });

    const destDirPath = pathJoin(buildOptions.keycloakifyBuildDirPath, "src", "main", "resources", "theme");

    log(`Downloading builtins theme of Keycloak ${keycloakVersion} here ${destDirPath}`);

    await downloadBuiltinKeycloakTheme({
        keycloakVersion,
        destDirPath,
        buildOptions
    });
}
