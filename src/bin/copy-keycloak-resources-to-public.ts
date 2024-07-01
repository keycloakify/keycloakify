import { copyKeycloakResourcesToPublic } from "./shared/copyKeycloakResourcesToPublic";
import { getBuildContext } from "./shared/buildContext";
import type { CliCommandOptions } from "./main";

export async function command(params: { cliCommandOptions: CliCommandOptions }) {
    const { cliCommandOptions } = params;

    const buildContext = getBuildContext({ cliCommandOptions });

    await copyKeycloakResourcesToPublic({
        buildContext
    });
}
