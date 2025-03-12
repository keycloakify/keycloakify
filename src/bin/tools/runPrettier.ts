import { getNodeModulesBinDirPath } from "./nodeModulesBinDirPath";
import { join as pathJoin, resolve as pathResolve } from "path";
import * as fsPr from "fs/promises";
import { id } from "tsafe/id";
import { assert, is } from "tsafe/assert";
import chalk from "chalk";
import * as crypto from "crypto";
import { symToStr } from "tsafe/symToStr";
import { readThisNpmPackageVersion } from "./readThisNpmPackageVersion";

getIsPrettierAvailable.cache = id<boolean | undefined>(undefined);

export async function getIsPrettierAvailable(): Promise<boolean> {
    if (getIsPrettierAvailable.cache !== undefined) {
        return getIsPrettierAvailable.cache;
    }

    const nodeModulesBinDirPath = getNodeModulesBinDirPath({
        packageJsonFilePath: undefined
    });

    const prettierBinPath = pathJoin(nodeModulesBinDirPath, "prettier");

    const stats = await fsPr.stat(prettierBinPath).catch(() => undefined);

    const isPrettierAvailable = stats?.isFile() ?? false;

    getIsPrettierAvailable.cache = isPrettierAvailable;

    return isPrettierAvailable;
}

type PrettierAndConfigHash = {
    prettier: typeof import("prettier");
    configHash: string;
};

getPrettier.cache = id<PrettierAndConfigHash | undefined>(undefined);

export async function getPrettier(): Promise<PrettierAndConfigHash> {
    assert(getIsPrettierAvailable());

    if (getPrettier.cache !== undefined) {
        return getPrettier.cache;
    }

    let prettier = id<typeof import("prettier") | undefined>(undefined);

    import_prettier: {
        // NOTE: When module is linked we want to make sure we import the correct version
        // of prettier, that is the one of the project, not the one of this repo.
        // So we do a sketchy eval to bypass ncc.
        // We make sure to only do that when linking, otherwise we import properly.
        if (readThisNpmPackageVersion().startsWith("0.0.0")) {
            eval(
                `${symToStr({ prettier })} = require("${pathResolve(pathJoin(getNodeModulesBinDirPath({ packageJsonFilePath: undefined }), "..", "prettier"))}")`
            );

            assert(!is<undefined>(prettier));

            break import_prettier;
        }

        prettier = await import("prettier");
    }

    const configHash = await (async () => {
        const configFilePath = await prettier.resolveConfigFile(
            pathJoin(getNodeModulesBinDirPath({ packageJsonFilePath: undefined }), "..")
        );

        if (configFilePath === null) {
            return "";
        }

        const data = await fsPr.readFile(configFilePath);

        return crypto.createHash("sha256").update(data).digest("hex");
    })();

    const prettierAndConfig: PrettierAndConfigHash = {
        prettier,
        configHash
    };

    getPrettier.cache = prettierAndConfig;

    return prettierAndConfig;
}

export async function runPrettier(params: {
    sourceCode: string;
    filePath: string;
}): Promise<string> {
    const { sourceCode, filePath } = params;

    let formattedSourceCode: string;

    try {
        const { prettier } = await getPrettier();

        const { ignored, inferredParser } = await prettier.getFileInfo(filePath, {
            resolveConfig: true
        });

        if (ignored || inferredParser === null) {
            return sourceCode;
        }

        const config = await prettier.resolveConfig(filePath);

        formattedSourceCode = await prettier.format(sourceCode, {
            ...config,
            filePath,
            parser: inferredParser
        });
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
