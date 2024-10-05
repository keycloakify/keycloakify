import type { BuildContext } from "./shared/buildContext";
import { generateKcGenTs } from "./shared/generateKcGenTs";

export async function command(params: { buildContext: BuildContext }) {
    const { buildContext } = params;

    await generateKcGenTs({ buildContext });
}
