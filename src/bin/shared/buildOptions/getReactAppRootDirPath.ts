import { getAbsoluteAndInOsFormatPath } from "../../tools/getAbsoluteAndInOsFormatPath";
import { assert } from "tsafe/assert";
import type { CliCommandOptions } from "../../main";

type CliCommandOptionsLike = {
    reactAppRootDirPath: string | undefined;
};

assert<CliCommandOptions extends CliCommandOptionsLike ? true : false>();

export function getReactAppRootDirPath(params: { cliCommandOptions: CliCommandOptionsLike }) {
    const { cliCommandOptions } = params;

    const reactAppRootDirPath = (() => {
        if (cliCommandOptions.reactAppRootDirPath === undefined) {
            return process.cwd();
        }

        return getAbsoluteAndInOsFormatPath({
            "pathIsh": cliCommandOptions.reactAppRootDirPath,
            "cwd": process.cwd()
        });
    })();

    return { reactAppRootDirPath };
}
