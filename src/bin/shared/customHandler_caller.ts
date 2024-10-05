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
import { is } from "tsafe/is";
import { dirname as pathDirname } from "path";
import * as fs from "fs";

assert<Equals<ApiVersion, "v1">>();

export function callHandlerIfAny(params: {
    commandName: CommandName;
    buildContext: BuildContext;
}) {
    const { commandName, buildContext } = params;

    if (!fs.readdirSync(pathDirname(process.argv[1])).includes(BIN_NAME)) {
        return;
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
    } catch (error) {
        assert(is<child_process.ExecException>(error));

        if (error.code === NOT_IMPLEMENTED_EXIT_CODE) {
            return;
        }

        process.exit(error.code);
    }

    process.exit(0);
}
