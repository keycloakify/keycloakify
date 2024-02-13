import parseArgv from "minimist";
import { getAbsoluteAndInOsFormatPath } from "../../tools/getAbsoluteAndInOsFormatPath";

export function getReactAppRootDirPath(params: { processArgv: string[] }) {
    const { processArgv } = params;

    const argv = parseArgv(processArgv);

    const reactAppRootDirPath = (() => {
        const arg = argv["project"] ?? argv["p"];

        if (typeof arg !== "string") {
            return process.cwd();
        }

        return getAbsoluteAndInOsFormatPath({
            "pathIsh": arg,
            "cwd": process.cwd()
        });
    })();

    return { reactAppRootDirPath };
}
