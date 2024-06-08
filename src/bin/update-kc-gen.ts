import type { CliCommandOptions } from "./main";
import { readBuildOptions } from "./shared/buildOptions";
import { generateKcGenTs } from "./shared/generateKcGenTs";

export async function command(params: { cliCommandOptions: CliCommandOptions }) {
    const { cliCommandOptions } = params;

    const buildOptions = readBuildOptions({
        cliCommandOptions
    });

    await generateKcGenTs({ buildOptions });
}
