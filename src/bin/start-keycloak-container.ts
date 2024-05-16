import { readBuildOptions } from "./shared/buildOptions";
import type { CliCommandOptions } from "./main";

export async function command(params: { cliCommandOptions: CliCommandOptions }) {
    const { cliCommandOptions } = params;

    const buildOptions = readBuildOptions({ cliCommandOptions });

    console.log("TODO", buildOptions);
}
