import { assert, type Equals } from "tsafe/assert";
import type { BuildContext } from "./buildContext";
import { CUSTOM_HANDLER_ENV_NAMES } from "./constants";
import {
    NOT_IMPLEMENTED_EXIT_CODE,
    type CommandName,
    BIN_NAME,
    ApiVersion
} from "./customHandler";
import * as child_process from "child_process";
import { getNodeModulesBinDirPath } from "../tools/nodeModulesBinDirPath";
import * as fs from "fs";

assert<Equals<ApiVersion, "v1">>();

export function maybeDelegateCommandToCustomHandler(params: {
    commandName: CommandName;
    buildContext: BuildContext;
}): { hasBeenHandled: boolean } {
    const { commandName, buildContext } = params;

    const nodeModulesBinDirPath = getNodeModulesBinDirPath();

    if (!fs.readdirSync(nodeModulesBinDirPath).includes(BIN_NAME)) {
        return { hasBeenHandled: false };
    }

    try {
        child_process.execSync(`npx ${BIN_NAME}`, {
            stdio: "inherit",
            env: {
                ...process.env,
                [CUSTOM_HANDLER_ENV_NAMES.COMMAND_NAME]: commandName,
                [CUSTOM_HANDLER_ENV_NAMES.BUILD_CONTEXT]: JSON.stringify(buildContext)
            }
        });
    } catch (error: any) {
        const status = error.status;

        if (status === NOT_IMPLEMENTED_EXIT_CODE) {
            return { hasBeenHandled: false };
        }

        process.exit(status);
    }

    return { hasBeenHandled: true };
}
