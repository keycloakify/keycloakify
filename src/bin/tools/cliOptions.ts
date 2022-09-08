import parseArgv from "minimist";

export type CliOptions = {
    isSilent: boolean;
    hasExternalAssets: boolean;
};

export const getCliOptions = (processArgv: string[]): CliOptions => {
    const argv = parseArgv(processArgv);

    return {
        isSilent: typeof argv["silent"] === "boolean" ? argv["silent"] : false,
        hasExternalAssets: argv["external-assets"] !== undefined
    };
};
