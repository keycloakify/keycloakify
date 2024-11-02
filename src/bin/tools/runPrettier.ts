import { getNodeModulesBinDirPath } from "./nodeModulesBinDirPath";
import { join as pathJoin } from "path";
import * as fsPr from "fs/promises";
import { id } from "tsafe/id";
import { assert } from "tsafe/assert";
import chalk from "chalk";

getIsPrettierAvailable.cache = id<boolean | undefined>(undefined);

export async function getIsPrettierAvailable(): Promise<boolean> {
    if (getIsPrettierAvailable.cache !== undefined) {
        return getIsPrettierAvailable.cache;
    }

    const nodeModulesBinDirPath = getNodeModulesBinDirPath();

    const prettierBinPath = pathJoin(nodeModulesBinDirPath, "prettier");

    const stats = await fsPr.stat(prettierBinPath).catch(() => undefined);

    const isPrettierAvailable = stats?.isFile() ?? false;

    getIsPrettierAvailable.cache = isPrettierAvailable;

    return isPrettierAvailable;
}

type PrettierAndConfig = {
    prettier: typeof import("prettier");
    config: import("prettier").Options | null;
};

getPrettierAndConfig.cache = id<PrettierAndConfig | undefined>(undefined);

export async function getPrettierAndConfig(): Promise<PrettierAndConfig> {
    assert(getIsPrettierAvailable());

    if (getPrettierAndConfig.cache !== undefined) {
        return getPrettierAndConfig.cache;
    }

    const prettier = await import("prettier");

    const prettierAndConfig: PrettierAndConfig = {
        prettier,
        config: await prettier.resolveConfig(pathJoin(getNodeModulesBinDirPath(), ".."))
    };

    getPrettierAndConfig.cache = prettierAndConfig;

    return prettierAndConfig;
}

export async function runPrettier(params: {
    sourceCode: string;
    filePath: string;
}): Promise<string> {
    const { sourceCode, filePath } = params;

    let formattedSourceCode: string;

    try {
        const { prettier, config } = await getPrettierAndConfig();

        formattedSourceCode = await prettier.format(sourceCode, { ...config, filePath });
    } catch (error) {
        console.log(
            chalk.red(
                `You probably need to upgrade the version of prettier in your project`
            )
        );

        throw error;
    }

    return formattedSourceCode;
}
