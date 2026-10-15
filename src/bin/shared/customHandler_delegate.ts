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
import { join as pathJoin } from "path";

assert<Equals<ApiVersion, "v1">>();

export async function maybeDelegateCommandToCustomHandler(params: {
    commandName: CommandName;
    buildContext: BuildContext;
}): Promise<{ hasBeenHandled: boolean }> {
    const { commandName, buildContext } = params;

    const nodeModulesBinDirPath = await getNodeModulesBinDirPath({
        packageJsonFilePath: buildContext.packageJsonFilePath
    });

    if (!fs.readdirSync(nodeModulesBinDirPath).includes(BIN_NAME)) {
        return { hasBeenHandled: false };
    }

    // NOTE: Run the binary we just checked rather than resolving it through npx,
    // npx resolves from process.cwd() which, in a monorepo, can be a different
    // directory (and pick up a global binary with the same name, or none at all).
    const binFilePath = pathJoin(
        nodeModulesBinDirPath,
        process.platform === "win32" ? `${BIN_NAME}.cmd` : BIN_NAME
    );

    const command = fs.existsSync(binFilePath) ? `"${binFilePath}"` : `npx ${BIN_NAME}`;

    try {
        child_process.execSync(command, {
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
