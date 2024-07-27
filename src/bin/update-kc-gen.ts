import type { CliCommandOptions } from "./main";
import { getBuildContext } from "./shared/buildContext";
import { generateKcGenTs } from "./shared/generateKcGenTs";

export async function command(params: { cliCommandOptions: CliCommandOptions }) {
    const { cliCommandOptions } = params;

    const buildContext = getBuildContext({
        cliCommandOptions
    });

    await generateKcGenTs({ buildContext });
}
